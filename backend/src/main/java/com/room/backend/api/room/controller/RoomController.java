package com.room.backend.api.room.controller;

import com.room.backend.api.room.dto.request.RoomCreateRequestDTO;
import com.room.backend.api.room.dto.request.RoomUpdateWithCheckAnswerRequestDTO;
import com.room.backend.api.room.dto.request.RoomWithCheckAnswerRequestDTO;
import com.room.backend.feature.roomregistration.adapter.web.RoomRegistrationRequestMapper;
import com.room.backend.feature.roomregistration.adapter.web.RoomRegistrationResponse;
import com.room.backend.feature.roomregistration.application.RegisterRoomWithChecklist;
import com.room.backend.feature.roomregistration.application.RegisteredRoom;
import com.room.backend.feature.roomlist.adapter.web.RoomListItemResponse;
import com.room.backend.feature.roomlist.application.ListMyRooms;
import com.room.backend.feature.roomlist.application.ListMyRoomsQuery;
import com.room.backend.feature.roomdetail.adapter.web.RoomDetailsResponse;
import com.room.backend.feature.roomdetail.application.GetRoomDetails;
import com.room.backend.feature.roomdetail.application.GetRoomDetailsQuery;
import com.room.backend.feature.roomanswersave.adapter.web.AnswerSubmissionMapper;
import com.room.backend.feature.roomanswersave.application.SaveRoomAnswers;
import com.room.backend.feature.roomdelete.application.DeleteRoom;
import com.room.backend.feature.roomupdate.adapter.web.RoomUpdateDataMapper;
import com.room.backend.feature.roomupdate.application.UpdateRoomWithAnswers;
import com.room.backend.feature.roomcreate.adapter.web.RoomCreateDataMapper;
import com.room.backend.feature.roomcreate.application.CreateRoom;
import com.room.backend.feature.shared.room.RoomSnapshot;
import com.room.backend.feature.shared.web.RoomMutationResponse;
import com.room.backend.domain.checklist.dto.request.RoomCheckAnswerRequestDTO;
import com.room.backend.domain.room.entity.enums.RentType;
import com.room.backend.domain.room.entity.enums.RoomSortType;
import com.room.backend.global.auth.util.SecurityUtil;
import com.room.backend.global.common.response.ApiResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import com.room.backend.global.common.exception.GeneralException;
import com.room.backend.global.common.exception.RoomErrorCode;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/rooms")
@RequiredArgsConstructor
@Tag(name = "Room", description = "방 관리")
public class RoomController {

    // 각 operation을 독립 slice로 순차 전환한다. 공통 추출은 전체 이관 뒤에만 한다.
    private final RegisterRoomWithChecklist registerRoomWithChecklist;
    private final ListMyRooms listMyRooms;
    private final GetRoomDetails getRoomDetails;
    private final SaveRoomAnswers saveRoomAnswers;
    private final DeleteRoom deleteRoom;
    private final UpdateRoomWithAnswers updateRoomWithAnswers;
    private final CreateRoom createBasicRoom;

    @PostMapping("/check-results")
    @Operation(summary = "방 + 체크리스트 등록", description = "새로운 방과 체크리스트를 등록합니다. 주소를 기반으로 좌표를 자동 변환합니다.")
    public ResponseEntity<ApiResponse<RoomRegistrationResponse>> createRoom(@Valid @RequestBody RoomWithCheckAnswerRequestDTO request) {
        Long userId = SecurityUtil.getCurrentUserId();
        RegisteredRoom registered = registerRoomWithChecklist.handle(
                RoomRegistrationRequestMapper.toCommand(request, userId));

        return ResponseEntity.ok(ApiResponse.success(RoomRegistrationResponse.from(registered)));
    }

    @PostMapping
    @Operation(summary = "방 등록", description = "새로운 방을 등록합니다. 주소를 기반으로 좌표를 자동 변환합니다.")
    public ResponseEntity<ApiResponse<RoomMutationResponse>> createRoom(@Valid @RequestBody RoomCreateRequestDTO request) {
        Long userId = SecurityUtil.getCurrentUserId();
        RoomSnapshot savedRoom = createBasicRoom.handle(userId, RoomCreateDataMapper.from(request));

        return ResponseEntity.ok(ApiResponse.success(RoomMutationResponse.from(savedRoom)));
    }

    @GetMapping
    @Operation(summary = "내 방들 목록 조회", description = "등록한 방 목록을 반환합니다. rentType 미입력 시 전체, sort 미입력 시 최신순 반환.")
    public ResponseEntity<ApiResponse<List<RoomListItemResponse>>> getRooms(
            @RequestParam(required = false) RentType rentType,
            @RequestParam(required = false) RoomSortType sort) {
        Long userId = SecurityUtil.getCurrentUserId();
        List<RoomListItemResponse> response =
            listMyRooms.handle(new ListMyRoomsQuery(userId, rentType, sort)).stream()
                .map(RoomListItemResponse::from)
                .toList();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "내 방 1개 조회", description = "방 한개를 체크리스트 결과와 함께 조회합니다")
    public ResponseEntity<ApiResponse<RoomDetailsResponse>> getRoom(@PathVariable Long id) {
        Long userId = SecurityUtil.getCurrentUserId();
        GetRoomDetails.Result details = getRoomDetails.handle(new GetRoomDetailsQuery(id, userId))
            .orElseThrow(() -> new GeneralException(RoomErrorCode.ROOM_NOT_FOUND));
        return ResponseEntity.ok(ApiResponse.success(RoomDetailsResponse.from(details)));
    }


    @PostMapping("/{id}/check-results")
    @Operation(summary = "체크리스트 답변 저장", description = "방에 대한 체크리스트 답변을 저장합니다")
    public ResponseEntity<ApiResponse<Void>> saveCheckResults(@PathVariable Long id,
            @RequestBody List<RoomCheckAnswerRequestDTO> answers) {
        saveRoomAnswers.handle(id, AnswerSubmissionMapper.from(answers));
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PutMapping("/{id}")
    @Operation(summary = "방 + 체크리스트 수정", description = "방 과 체크리스트를 수정합니다")
    public ResponseEntity<ApiResponse<RoomMutationResponse>> updateRoom(@Valid @RequestBody RoomUpdateWithCheckAnswerRequestDTO request, @PathVariable Long id) {
        Long userId = SecurityUtil.getCurrentUserId();
        RoomSnapshot editedRoom = updateRoomWithAnswers.handle(id, userId, RoomUpdateDataMapper.from(request))
                .orElseThrow(() -> new GeneralException(RoomErrorCode.ROOM_NOT_FOUND))
                .room();

        return ResponseEntity.ok(ApiResponse.success(RoomMutationResponse.from(editedRoom)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "내 방 1개 삭제", description = "방 한개를 삭제합니다")
    public ResponseEntity<ApiResponse<Void>> deleteRoom(@PathVariable Long id) {
        Long userId = SecurityUtil.getCurrentUserId();
        if (!deleteRoom.handle(id, userId)) {
            throw new GeneralException(RoomErrorCode.ROOM_NOT_FOUND);
        }

        return ResponseEntity.ok(ApiResponse.success(null));

    }

}
