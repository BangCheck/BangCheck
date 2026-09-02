import unittest

import pm_snapshot


class LifecycleByIssueTest(unittest.TestCase):
    def test_tracks_issue_without_closing_pull_request(self):
        lifecycle = pm_snapshot.lifecycle_by_issue(
            {10},
            [{"number": 10, "state": "OPEN", "closedByPullRequestsReferences": []}],
            [],
        )

        self.assertEqual("TRACKED", lifecycle[10])

    def test_marks_issue_with_open_closing_pull_request_in_progress(self):
        lifecycle = pm_snapshot.lifecycle_by_issue(
            {10},
            [{"number": 10, "state": "OPEN", "closedByPullRequestsReferences": [{"number": 20}]}],
            [{"number": 20, "state": "OPEN", "mergedAt": None}],
        )

        self.assertEqual("IN_PROGRESS", lifecycle[10])

    def test_marks_issue_with_merged_closing_pull_request_resolved(self):
        lifecycle = pm_snapshot.lifecycle_by_issue(
            {10},
            [{"number": 10, "state": "CLOSED", "closedByPullRequestsReferences": [{"number": 20}]}],
            [{"number": 20, "state": "MERGED", "mergedAt": "2026-09-02T10:00:00Z"}],
        )

        self.assertEqual("RESOLVED", lifecycle[10])

    def test_merged_pull_request_wins_over_open_pull_request(self):
        lifecycle = pm_snapshot.lifecycle_by_issue(
            {10},
            [{
                "number": 10,
                "state": "CLOSED",
                "closedByPullRequestsReferences": [{"number": 20}, {"number": 21}],
            }],
            [
                {"number": 20, "state": "OPEN", "mergedAt": None},
                {"number": 21, "state": "MERGED", "mergedAt": "2026-09-02T10:00:00Z"},
            ],
        )

        self.assertEqual("RESOLVED", lifecycle[10])

    def test_missing_issue_fails_instead_of_guessing(self):
        with self.assertRaisesRegex(RuntimeError, "issue #10"):
            pm_snapshot.lifecycle_by_issue({10}, [], [])

    def test_missing_pull_request_fails_instead_of_guessing(self):
        with self.assertRaisesRegex(RuntimeError, "PR #20"):
            pm_snapshot.lifecycle_by_issue(
                {10},
                [{"number": 10, "state": "OPEN", "closedByPullRequestsReferences": [{"number": 20}]}],
                [],
            )


class DefectLifecycleTest(unittest.TestCase):
    def test_invalid_issue_is_observed(self):
        self.assertEqual("OBSERVED", pm_snapshot.defect_lifecycle({"issue": True}, {1: "RESOLVED"}))

    def test_github_lifecycle_is_used_for_valid_issue(self):
        self.assertEqual(
            "IN_PROGRESS",
            pm_snapshot.defect_lifecycle({"issue": 10}, {10: "IN_PROGRESS"}),
        )


if __name__ == "__main__":
    unittest.main()
