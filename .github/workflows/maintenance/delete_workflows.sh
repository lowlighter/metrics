#!/bin/bash
set -e

# Simple script to remove workflows that are not successful or failed (with completion status like skipped, cancelled, etc.)
# It also removes successful or failed workflows that doesn't have artifacts or logs.
# You need to be logged to 'gh' first

# owner/repo syntax
repo="$1"

temp_file="workflow_runs.payload"
rm -rf $temp_file

echo "Fetching workflows..."
echo $(gh api /repos/${repo}/actions/runs --paginate | jq '{count: .total_count, runs: [.workflow_runs[] | select(.status=="completed") | {id, conclusion}]}') | jq '.' > $temp_file

ids_to_delete=$(cat "$temp_file" | jq -r '.runs | .[] | select((.conclusion!="success") and (.conclusion!="failure")) | .id')

if [ "${ids_to_delete}" = "" ]
then
	echo "All workflows are exited successfully or failed. Nothing to remove"
else
	echo "Removing all the workflows that are not successful or failed..."
	while read -r line; do
		id="$line"
		## Workaround for https://github.com/cli/cli/issues/4286 and https://github.com/cli/cli/issues/3937
		echo -n | gh api --method DELETE /repos/${repo}/actions/runs/${id} --input -
		
		echo "Stale workflow run with ID $id deleted successfully!"
	done <<< $ids_to_delete
fi

ids_to_delete=$(cat "$temp_file" | jq -r '.runs | .[] | select((.conclusion=="success") or (.conclusion=="failure")) | .id')

if [ "${ids_to_delete}" = "" ]
then
	echo "No workflows to check for logs or artifacts. Exiting..."
else
	echo -e "\nDeleting workflows without logs and artifacts..."
	while read -r line; do
		id="$line"
		artifact_count=$(gh api /repos/${repo}/actions/runs/${id}/artifacts | jq -r '.total_count')
		if [ "${artifact_count}" = "0" ]
		then
			gh api --silent /repos/${repo}/actions/runs/${id}/logs || \ 
				echo -n | gh api --method DELETE /repos/${repo}/actions/runs/${id} --input - && \
				echo "Workflow run without logs and artifacts with ID $id deleted successfully!"
		fi
	done <<< $ids_to_delete
fi

rm -rf $temp_file
echo -e "\n\nFinished the workflow run cleaning process"
exit 0
