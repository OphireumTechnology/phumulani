/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phumulani Phase 13 — Client Development Transparency, GitHub Integration & Local Synchronization
 * Type Definitions & Data Models
 */

export type DevelopmentMilestoneStatus =
  | 'NOT_STARTED'
  | 'IN_DEVELOPMENT'
  | 'IMPLEMENTED_UNVERIFIED'
  | 'TESTING'
  | 'BLOCKED'
  | 'READY_FOR_CLIENT_REVIEW'
  | 'CLIENT_APPROVED'
  | 'PRODUCTION_VERIFIED'
  | 'FAILED';

export type MilestoneTestingStatus =
  | 'UNTESTED'
  | 'TESTS_IN_PROGRESS'
  | 'PASSED'
  | 'FAILED';

export type ClientAcceptanceStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'REOPENED';

export interface MilestoneDeliverable {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  verifiedAt?: string;
}

export interface MilestoneApprovalRecord {
  id: string;
  approverId: string;
  approverName: string;
  approverRole: string;
  decision: 'APPROVED' | 'REJECTED' | 'CONDITIONAL_APPROVAL';
  timestamp: string;
  approvedArtifactVersion: string;
  comments: string;
  milestoneId: string;
  auditReference: string;
}

export interface DevelopmentMilestone {
  id: string; // e.g. 'M13.01', 'M13.02'
  phase: number; // e.g. 13
  title: string;
  description: string;
  deliverables: MilestoneDeliverable[];
  weight: number; // approved weight percentage (0-100)
  dependencies: string[]; // milestone IDs
  assignedOwner: string; // e.g. 'Ophireum Technology Lead'
  startDate: string;
  targetDate: string;
  actualCompletionDate?: string;
  developmentStatus: DevelopmentMilestoneStatus;
  testingStatus: MilestoneTestingStatus;
  evidence: string[]; // Commit SHAs, test run IDs, verification logs
  clientAcceptanceStatus: ClientAcceptanceStatus;
  approvals: MilestoneApprovalRecord[];
}

export interface DevelopmentFeature {
  id: string;
  milestoneId: string;
  title: string;
  category: 'CORE_PORTAL' | 'SAFEGUARDING' | 'AI_GATEWAY' | 'FINANCIAL' | 'EMAIL_OPS' | 'TRANSPARENCY' | 'SYNC_ENGINE';
  description: string;
  assignedOwner: string;
  status: 'BACKLOG' | 'IN_PROGRESS' | 'COMPLETED' | 'TESTED' | 'CLIENT_ACCEPTED';
  acceptanceCriteria: string[];
  evidenceSha?: string;
  clientFeedbackCount: number;
  lastUpdated: string;
}

export type GitHubWorkflowStatus =
  | 'QUEUED'
  | 'IN_PROGRESS'
  | 'SUCCESS'
  | 'FAILURE'
  | 'CANCELLED'
  | 'SKIPPED'
  | 'UNKNOWN';

export interface GitHubWorkflowRun {
  id: string;
  workflowName: string;
  runNumber: number;
  event: 'push' | 'pull_request' | 'workflow_dispatch';
  triggeringBranch: string;
  commitSha: string;
  commitMessage: string;
  author: string;
  timestamp: string;
  buildStatus: GitHubWorkflowStatus;
  testStatus: GitHubWorkflowStatus;
  deploymentStatus: GitHubWorkflowStatus; // If skipped on PR, must remain SKIPPED!
  failureDetails?: string;
  simplifiedClientExplanation: string;
  workflowUrl: string;
  durationSeconds: number;
}

export interface GitHubCommitRecord {
  sha: string;
  shortSha: string;
  branch: string;
  author: string;
  timestamp: string;
  technicalMessage: string;
  clientFriendlyDescription: string;
  verified: boolean;
  component: string;
  filesChangedCount: number;
}

export interface GitHubPullRequest {
  id: number;
  title: string;
  clientSummary: string;
  author: string;
  sourceBranch: string;
  targetBranch: string;
  status: 'OPEN' | 'MERGED' | 'CLOSED';
  createdAt: string;
  mergedAt?: string;
  reviewStatus: 'CHANGES_REQUESTED' | 'APPROVED' | 'PENDING';
  ciStatus: GitHubWorkflowStatus;
  headSha: string;
}

export interface GitHubRepoMetadata {
  repoName: string;
  owner: string;
  defaultBranch: string;
  currentBranch: string;
  openIssuesCount: number;
  openPullRequestsCount: number;
  lastSyncedAt: string;
  lastCommitSha: string;
  connectedViaServer: boolean;
}

export type LocalSyncStatusType =
  | 'SYNCHRONIZED'
  | 'AHEAD'
  | 'BEHIND'
  | 'DIVERGED'
  | 'DIRTY_WORKING_TREE'
  | 'STALE'
  | 'UNAUTHORIZED'
  | 'UNKNOWN';

export interface LocalSyncReport {
  project: string;
  branch: string;
  localPath: string; // e.g. D:\Phumulani\Development\phumulani-platform
  controllerPath: string; // e.g. D:\Phumulani\SyncController
  localCommit: string;
  remoteCommit: string;
  ahead: number;
  behind: number;
  uncommittedChanges: number;
  status: LocalSyncStatusType;
  checkedAt: string;
  reportedBy: string;
  authTokenUsed?: string;
  isStale: boolean; // calculated if checkedAt > 24 hours ago
  sanitizedSummary: string;
}

export type DevelopmentActivityEventType =
  | 'FEATURE_STARTED'
  | 'FEATURE_COMPLETED'
  | 'PULL_REQUEST_OPENED'
  | 'PULL_REQUEST_MERGED'
  | 'BUILD_PASSED'
  | 'BUILD_FAILED'
  | 'TEST_PASSED'
  | 'TEST_FAILED'
  | 'MILESTONE_APPROVED'
  | 'CLIENT_FEEDBACK_SUBMITTED'
  | 'DEFECT_RESOLVED'
  | 'STAGING_RELEASE_PUBLISHED'
  | 'PRODUCTION_RELEASE_VERIFIED'
  | 'LOCAL_SYNC_INGESTED';

export interface DevelopmentActivityEvent {
  id: string;
  type: DevelopmentActivityEventType;
  sourceSystem: 'GOOGLE_AI_STUDIO' | 'GITHUB' | 'GITHUB_ACTIONS' | 'WINDOWS_SYNC_CONTROLLER' | 'CLIENT_PORTAL';
  timestamp: string;
  responsibleActor: string;
  component: string;
  eventStatus: 'SUCCESS' | 'WARNING' | 'FAILURE' | 'INFO';
  title: string;
  clientDescription: string;
  evidenceReference: string;
}

export type ClientFeedbackType =
  | 'General Feedback'
  | 'Design Change'
  | 'Functional Issue'
  | 'New Feature Request'
  | 'Content Correction'
  | 'Accessibility Concern'
  | 'Performance Issue'
  | 'Security Concern'
  | 'Acceptance Feedback';

export type ClientFeedbackPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type ClientFeedbackStatus =
  | 'SUBMITTED'
  | 'UNDER_ASSESSMENT'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'DEFERRED'
  | 'REJECTED';

export interface ClientFeedbackItem {
  id: string; // Ref number e.g. FB-104
  feedbackType: ClientFeedbackType;
  title: string;
  description: string;
  submittedBy: string;
  submitterEmail: string;
  submitterRole: string;
  submissionDate: string;
  relatedFeatureId?: string;
  relatedMilestoneId?: string;
  priority: ClientFeedbackPriority;
  status: ClientFeedbackStatus;
  assignedDeveloper?: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  attachments?: string[];
  doesImpactScopeOrBudget: boolean; // Cannot automatically alter budget without formal Change Request
}

export type ChangeRequestStatus =
  | 'PROPOSED'
  | 'TECHNICAL_ASSESSMENT'
  | 'CLIENT_APPROVAL_REQUIRED'
  | 'APPROVED'
  | 'DECLINED'
  | 'IMPLEMENTED';

export interface ChangeRequestItem {
  id: string; // CR-201
  title: string;
  description: string;
  rationale: string;
  requestedBy: string;
  requestDate: string;
  estimatedHours: number;
  budgetImpactUSD: number;
  scheduleImpactDays: number;
  affectedMilestones: string[];
  status: ChangeRequestStatus;
  approvedBy?: string;
  approvalDate?: string;
  implementationNotes?: string;
}

export type ProjectDocumentCategory =
  | 'Original Project Proposal'
  | 'Approved Development Directives'
  | 'Architecture Documents'
  | 'Development Roadmaps'
  | 'Milestone Reports'
  | 'Testing Reports'
  | 'Release Notes'
  | 'Client Approval Records'
  | 'Change Requests'
  | 'Operational Manuals'
  | 'Deployment Verification Reports';

export interface ProjectDocumentRecord {
  id: string;
  title: string;
  category: ProjectDocumentCategory;
  fileName: string;
  version: string;
  publishedDate: string;
  fileSizeBytes: number;
  author: string;
  sha256Hash: string;
  accessTier: 'PUBLIC' | 'CLIENT_CONFIDENTIAL' | 'INTERNAL_DEVELOPER';
  downloadUrl?: string;
  description: string;
}

export interface WeeklyDevelopmentReport {
  id: string; // WDR-2026-W42
  reportingPeriod: string; // e.g. Oct 18, 2026 – Oct 24, 2026
  publishedDate: string;
  executiveSummary: string;
  completedMilestones: string[];
  activeMilestones: string[];
  newFeaturesDelivered: string[];
  testsCompletedCount: number;
  testsPassedCount: number;
  outstandingDefectsCount: number;
  githubActivitySummary: string;
  deploymentStatusSummary: string;
  clientFeedbackSummary: string;
  pendingApprovals: string[];
  risksAndBlockers: string[];
  nextDevelopmentPriorities: string[];
  timelineChangesSummary: string;
  supportingEvidenceLinks: string[];
  generatedBy: string;
  verifiedBy: string;
  isApprovedForDistribution: boolean;
}

export interface ProjectTransparencyOverview {
  projectName: string;
  developmentOrganization: string;
  currentApprovedPhase: string;
  lastVerifiedProjectUpdate: string;
  currentReleaseVersion: string;
  overallMilestoneProgress: number; // 0-100 calculated by approved weights
  implementationProgress: number; // 0-100
  testingProgress: number; // 0-100
  clientAcceptanceProgress: number; // 0-100
  productionReadinessProgress: number; // 0-100
  nextExpectedMilestone: string;
  latestStagingPreviewUrl: string;
  stagingAvailability: 'AVAILABLE' | 'MAINTENANCE' | 'OFFLINE';
  kpis: {
    verifiedProgressPercent: number;
    completedMilestonesCount: number;
    activeMilestonesCount: number;
    pendingMilestonesCount: number;
    featuresDeliveredCount: number;
    featuresAwaitingAcceptanceCount: number;
    openDevelopmentIssuesCount: number;
    resolvedDevelopmentIssuesCount: number;
    latestSuccessfulBuildSha: string;
    latestSuccessfulBuildTime: string;
    latestVerifiedDeploymentEnv: string;
    latestVerifiedDeploymentTime: string;
    pendingClientApprovalsCount: number;
    currentProjectDeliveryStatus: 'ON_TRACK' | 'AT_RISK' | 'DELAYED' | 'BLOCKED';
  };
}
