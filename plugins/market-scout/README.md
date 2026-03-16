# Market Scout Plugin

Automated business intelligence and market opportunity scanner. Monitors your configured topic areas 24/7 and surfaces actionable opportunities — especially international tools not yet available in Finland.

## Features

- **24/7 automated scanning** via GitHub Actions (4x daily)
- **Finland opportunity detection** — finds international solutions with no Finnish market presence
- **Multi-agent research** — parallel agents for each topic area
- **Trend analysis** — identifies accelerating trends and strategic signals
- **Email digests** — daily reports delivered to your inbox
- **Manual scanning** — `/scout` command for on-demand research

## Quick Start

### 1. Configure Your Topics

Edit `config/topics.json` to add your topic areas:

```json
{
  "topics": [
    {
      "id": "ai-tools",
      "name": "AI Tools & Integrations",
      "keywords": ["AI productivity tools", "LLM tools business"],
      "active": true
    }
  ]
}
```

### 2. Set Up GitHub Secrets

Add these secrets to your GitHub repository (Settings → Secrets → Actions):

| Secret | Description |
|--------|-------------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key |
| `MAIL_USERNAME` | Gmail address for sending reports |
| `MAIL_PASSWORD` | Gmail App Password (not regular password) |
| `MAIL_RECIPIENT` | Your email address to receive reports |

> **Gmail setup:** Enable 2FA → Google Account → Security → App Passwords → Generate

### 3. Enable the Workflow

The workflow at `.github/workflows/market-scout.yml` will automatically run 4x daily once the secrets are configured.

To test immediately: Go to Actions → Market Scout → Run workflow.

## Commands

| Command | Description |
|---------|-------------|
| `/scout` | Run a full scan of all configured topics |
| `/scout ai-tools` | Scan a specific topic only |
| `/add-topic` | Interactively add a new topic to monitor |
| `/view-reports` | List and browse recent reports |
| `/view-reports latest` | Show the most recent report in full |

## Reports

Reports are saved to `reports/YYYY-MM-DD-HHmm.md` and indexed at `reports/INDEX.md`.

Each report includes:
- 🔥 Top Finland market opportunities (scored 1-10)
- 📈 Key trends and strategic signals
- 🌍 International developments by topic
- 💡 One key strategic insight

## Agents

| Agent | Role |
|-------|------|
| `topic-researcher` | Researches latest news and products per topic |
| `finland-opportunity-scanner` | Finds international solutions not yet in Finland |
| `trend-analyzer` | Identifies patterns and strategic signals |
| `report-compiler` | Compiles all findings into actionable reports |

## Customization

### Add More Topics

```
/add-topic
```

Or manually edit `config/topics.json`.

### Change Scan Frequency

Edit the cron schedule in `.github/workflows/market-scout.yml`:

```yaml
schedule:
  - cron: '0 4 * * *'   # 06:00 Finnish time
  - cron: '0 16 * * *'  # 18:00 Finnish time
```

### Adjust Opportunity Scoring Threshold

In `config/topics.json`, change `min_opportunity_score` (default: 6):

```json
"report_settings": {
  "min_opportunity_score": 7
}
```

## Cost Estimate

- ~4 Claude API calls per run × 4 runs/day = ~16 API calls/day
- Using `claude-sonnet-4-6`: approximately $1-3/day depending on research depth
- GitHub Actions: Free tier (2000 min/month) covers this usage
