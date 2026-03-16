# /view-reports

List and display recent market intelligence reports.

## Usage

```
/view-reports           (show last 5 reports)
/view-reports 10        (show last 10 reports)
/view-reports latest    (show the most recent report in full)
```

## Instructions

When invoked:

1. List files in the `reports/` directory, sorted by newest first
2. Show a summary table with:
   - Date/time of report
   - Number of Finland opportunities found
   - Top opportunity name and score
3. If "latest" argument is provided, display the full content of the most recent report
4. If a number is provided, show that many reports in the summary

## Output Format

```
📋 Recent Market Intelligence Reports

Date                 | Opportunities | Top Find
---------------------|---------------|---------------------------
2026-03-15 18:00    | 4 (2 high)    | AI workflow tool — 9/10
2026-03-15 12:00    | 3 (1 high)    | No-code platform — 8/10
2026-03-15 06:00    | 5 (3 high)    | DevOps AI assistant — 9/10

Run `/view-reports latest` to see the full latest report.
Run `/scout` to start a new scan now.
```

## Notes

- Reports are stored as markdown files in `reports/YYYY-MM-DD-HHmm.md`
- If no reports exist yet, suggest running `/scout` first
