
# Translate bot

The helpful bot watches the repository and performs following actions:

1. When a PR is created
    - PR gets a `review needed` label.
    - Review requested from the @translate-(lang) team.
    - PR # and author is appended to the progress issue item matching PR title 
        - if no such item, bot writes a comment to PR suggesting to change the title
2. When PR changes requested by a reviewer
    - PR label changes: `review needed` -> `changes requested`
    - Bot writes a comment suggesting to comment `/done` when changes are finished
3. When PR comment `/done` appears
    - PR label changes back: `changes requested` -> `review needed` 
4. When changes are approved
    - PR label changes `review needed` -> `needs +1`
    - The next reviewer may ask for changes leading to more `review needed/changes requested` cycles
    - When a reviewer is satisfied with the PR with `needs +1`, they merge it.
5. When a PR is merged
    - The progress issue item is labeled with `[x]`
    - The bot sends Congratz
