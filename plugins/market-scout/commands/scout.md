# /scout

Run an immediate market intelligence scan for the specified topic or all configured topics.

## Usage

```
/scout [topic-id]
/scout ai-tools
/scout devtools
/scout          (runs all configured topics)
```

## What This Does

1. Reads your configured topics from `plugins/market-scout/config/topics.json`
2. Runs the topic-researcher agent for each topic
3. Runs the finland-opportunity-scanner to find market gaps
4. Runs the trend-analyzer to identify patterns
5. Compiles everything into a report with report-compiler
6. Saves the report to `reports/` directory

## Instructions

When invoked:

1. Read the topics configuration from `plugins/market-scout/config/topics.json`
2. If a topic-id argument is provided, filter to only that topic
3. Launch topic-researcher agent for each topic in parallel
4. Launch finland-opportunity-scanner with all topics as context
5. Wait for all research to complete
6. Launch trend-analyzer with all findings
7. Launch report-compiler with all data
8. Save the resulting report as `reports/YYYY-MM-DD-HHmm.md`
9. Display the report summary to the user
10. Indicate where the full report was saved

## Output

Show the user:
- A brief summary of findings
- Top 3 Finland opportunities
- Path to the saved report file

## Example Output

```
✅ Market Scout completed (2026-03-15 14:30)

🔥 Top 3 Finland Opportunities:
1. [Product] — Score: 9/10 — AI workflow automation tool
2. [Product] — Score: 8/10 — Developer productivity platform
3. [Product] — Score: 7/10 — No-code integration builder

📊 Full report saved to: reports/2026-03-15-1430.md
```
