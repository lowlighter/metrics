#!/bin/bash
set -e

# Simple script to remove dangling images from GHCR
# You need to be logged to 'gh' first.

# package_name syntax. i.e: jellyfin-vue
owner="$1"
container="$2"
temp_file="ghcr_prune.ids"
rm -rf $temp_file

echo "Fetching dangling images from GHCR..."
gh api /users/${owner}/packages/container/${container}/versions --paginate > $temp_file

ids_to_delete=$(cat "$temp_file" | jq -r '.[] | select(.metadata.container.tags==[]) | .id')

if [ "${ids_to_delete}" = "" ]
then
	echo "There are no dangling images to remove for this package"
	exit 0
fi

echo -e "\nDeleting dangling images..."
while read -r line; do
	id="$line"
	echo "Processing image $id"
	## Workaround for https://github.com/cli/cli/issues/4286 and https://github.com/cli/cli/issues/3937
	echo -n | gh api --method DELETE /users/${owner}/packages/container/${container}/versions/${id} --input -
	echo Dangling image with ID $id deleted successfully
done <<< $ids_to_delete

rm -rf $temp_file
echo -e "\nAll the dangling images have been removed successfully"
exit 0
