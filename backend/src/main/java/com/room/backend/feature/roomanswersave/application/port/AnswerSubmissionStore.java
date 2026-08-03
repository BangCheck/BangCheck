package com.room.backend.feature.roomanswersave.application.port;

import com.room.backend.feature.roomanswersave.domain.AnswerSubmission;
import java.util.List;

public interface AnswerSubmissionStore { void save(long roomId, List<AnswerSubmission> answers); }
