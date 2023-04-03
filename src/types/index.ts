// Description: This file contains all the types used in the application

//interface for the gitlab merge request changes
export interface ChangesGitLab {
  diff: string;
  new_path: string;
  old_path: string;
  a_mode: string;
  b_mode: string;
  new_file: boolean;
  renamed_file: boolean;
  deleted_file: boolean;
}
