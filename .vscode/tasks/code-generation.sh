set -ex

jinjaroot generate
cp python/figurl/backend/tasks/task_function_ids.json src/task_function_ids.json
exec .vscode/tasks/create_gen_ts_files.py