const text: string = "# Set external unit metrics for sorting\n\nHere is an example script for setting external unit metrics for a sorting. Run the following script on the computer running the task backend.\n\n```python\nfrom typing import cast\nimport sortingview as sv\n\n# Specify the workspace URI and the sorting ID\nworkspace_uri = '<|WORKSPACE_URI|>'\nsorting_id = '<|SORTING_ID|>'\n\n# Load the workspace\nW = sv.load_workspace(workspace_uri)\n\n# define external_metrics (this is just an example)\nS = W.get_sorting(sorting_id)\nsorting = sv.LabboxEphysSortingExtractor(S['sortingObject'])\nunit_ids = sorting.get_unit_ids()\nmetric_name = 'example-metric'\nmetric_data = {}\nfor unit_id in unit_ids:\n    metric_data[str(unit_id)] = len(cast(list, sorting.get_unit_spike_train(unit_id)))\nexternal_metrics = [{'name': metric_name, 'label': metric_name, 'tooltip': metric_name, 'data': metric_data }]\n#################################################################[#6](https://github.com/magland/sortingview/issues/6)\n\n# Set the unit external unit metrics for the sorting\nW.set_unit_metrics_for_sorting(sorting_id=sorting_id, metrics=external_metrics)\n```"

export default text