# How to View Frontend Logs in Seq

## Quick Filter

In the Seq search bar at the top, type:

```
Source = 'Frontend'
```

This will show only logs from the frontend application.

## Create a Signal (Recommended)

1. In the right sidebar, find the **SIGNALS** section
2. Click the **+** button or "Add Signal"
3. In the search/query box, enter:
   ```
   Source = 'Frontend'
   ```
4. Name it "Frontend Logs" or similar
5. Click Save

Now you can quickly filter to frontend logs by clicking on this signal in the sidebar.

## Filter by Log Level

To see only frontend errors:

```
Source = 'Frontend' and Level = 'Error'
```

To see frontend warnings:

```
Source = 'Frontend' and Level = 'Warning'
```

## Filter by Component/Context

If you log with properties, you can filter by them:

```
Source = 'Frontend' and Component = 'UserProfile'
```

## Common Queries

### All Frontend Logs

```
Source = 'Frontend'
```

### Frontend Errors Only

```
Source = 'Frontend' and Level = 'Error'
```

### Frontend Logs from Last Hour

```
Source = 'Frontend' and @Timestamp > ago(1h)
```

### Frontend Logs with Specific User

```
Source = 'Frontend' and UserId = '123'
```

### Frontend API Errors

```
Source = 'Frontend' and MessageTemplate like '%API%' and Level = 'Error'
```

## Tips

- Use the time range selector (top left) to filter by time
- Click on any log entry to see all its properties
- Use the search bar for quick filtering
- Create saved signals for frequently used filters
