import json
import os

def restore_archived_metadata():
    """
    Restores metadata from the archived file (metadata_archived.json)
    to the main metadata file (metadata.json).
    It merges the archived data into the main data.
    If the main metadata file doesn't exist or is empty, it creates it
    with the archived data.
    """
    backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    data_dir = os.path.join(backend_dir, 'data')
    archived_file_path = os.path.join(data_dir, 'metadata_archived.json')
    main_file_path = os.path.join(data_dir, 'metadata.json')

    try:
        # Read archived data
        with open(archived_file_path, 'r', encoding='utf-8') as f_archived:
            archived_data = json.load(f_archived)
        print(f"Read {len(archived_data)} items from {archived_file_path}")

        # Read main data (or initialize if not exists/empty)
        main_data = {}
        if os.path.exists(main_file_path):
            try:
                with open(main_file_path, 'r', encoding='utf-8') as f_main:
                    content = f_main.read()
                    if content.strip(): # Check if file is not empty
                        main_data = json.loads(content)
                        print(f"Read {len(main_data)} items from existing {main_file_path}")
                    else:
                        print(f"{main_file_path} exists but is empty. Initializing with archived data.")
            except json.JSONDecodeError:
                print(f"Error decoding JSON from {main_file_path}. Initializing with archived data.")
            except Exception as e:
                print(f"Error reading {main_file_path}: {e}. Initializing with archived data.")
        else:
            print(f"{main_file_path} does not exist. Creating it with archived data.")

        # Merge archived data into main data (overwrite if UUID exists)
        # You might want different merge logic depending on requirements
        main_data.update(archived_data)
        print(f"Total items after merging: {len(main_data)}")

        # Write merged data back to main file
        with open(main_file_path, 'w', encoding='utf-8') as f_main:
            json.dump(main_data, f_main, indent=4, ensure_ascii=False)
        print(f"Successfully restored data to {main_file_path}")

    except FileNotFoundError:
        print(f"Error: Archived metadata file not found at {archived_file_path}")
    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from {archived_file_path}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

if __name__ == "__main__":
    print("Running Restore_Archived script...")
    restore_archived_metadata()
    print("Restore_Archived script finished.") 