# /add-topic

Interactively add a new topic area to monitor.

## Usage

```
/add-topic
```

## What This Does

Guides you through adding a new topic to `plugins/market-scout/config/topics.json`.

## Instructions

When invoked, interactively ask the user:

1. **Topic name**: What is the name of this topic area? (e.g., "HR Tech", "Legal Tech", "FinTech")
2. **Keywords**: What search keywords should be used? (suggest 3-5 based on topic name)
3. **Focus**: What's the primary focus? (e.g., "B2B tools", "enterprise solutions", "developer tools")

Then:
1. Read current `plugins/market-scout/config/topics.json`
2. Generate a URL-friendly id from the topic name (lowercase, hyphens)
3. Add the new topic to the topics array
4. Write the updated config back to the file
5. Confirm to the user: "Topic '[name]' added! Run /scout [id] to search it now."

## Example Interaction

```
User: /add-topic
Assistant: Let's add a new topic to monitor.

What topic area would you like to track? (e.g., "HR Tech", "Legal Tech", "FinTech")
User: HR Tech

Suggested keywords: ["HR software", "employee management", "HR automation", "talent acquisition", "people ops"]
Are these good, or would you like to modify them?
User: Add "Finnish HR" as well

Topic focus: B2B tools / Enterprise?
User: SMB focused

✅ Added topic "HR Tech" (id: hr-tech) with 6 keywords.
Run /scout hr-tech to search it now, or it will be included in the next scheduled scan.
```