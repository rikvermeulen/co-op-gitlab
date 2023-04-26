// This file contains all the types used in the application

export interface GitLabChanges {
  diff: string;
  new_path: string;
  old_path: string;
  a_mode: string;
  b_mode: string;
  new_file: boolean;
  renamed_file: boolean;
  deleted_file: boolean;
}

export type GitlabMergeEvent = {
  user: { name: string };
  project: { id: number; name: string };
  object_attributes: {
    title: string;
    state: string;
    action: string;
    iid: number;
    url: string;
    source_branch: string;
    target_branch: string;
    work_in_progress: boolean;
    description: string;
  };
  labels: { title: string }[];
};

export type GitlabNoteEvent = {
  object_attributes: {
    noteable_type: string;
    note: string;
    id: number;
  };
  merge_request: {
    iid: number;
    source_project_id: number;
    source_branch: string;
  };
  user: {
    username: string;
  };
};

export interface GitlabCommentPosition {
  base_sha: string;
  start_sha: string;
  head_sha: string;
  position_type: string;
  new_path: string;
  old_path: string;
  new_line: number;
}

export interface GitlabCommentPayload {
  body: string;
  position: GitlabCommentPosition;
}
