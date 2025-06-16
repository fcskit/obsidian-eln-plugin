---
ELN version: 1.0.0
cssclasses:
  - wide-page
  - dashboard
banner: "![[obsidian-eln-banner.png]]"
banner_y: 0.336
date created: 2023-03-25
author: Me
note type: dashboard
tags: dashboard
---

# Project Management

- ### [[Projects]]
  ```dataview
  LIST
  FROM #project
  WHERE project.status = "active"
  ```

- ### [[Meetings]]
  ```dataview
  LIST
  FROM #meeting AND !"assets"
  SORT file.mtime.ts ASC
  LIMIT 6
  ```

- ### [[Daily Notes]]
  ```dataview
  LIST
  FROM #daily-note  AND !"assets"
  SORT file.mtime.ts ASC
  LIMIT 6
  ``` 

# Open Tasks

```dataviewjs
// add class to dataview container
dv.container.addClass('open-tasks-container');

const query = dv.pages('!"assets" AND !"Notes/HowTos"').file.tasks
    .where(t => !t.completed && !t.checked);

const noteList = [...new Set(query.map(t => t.path))].sort();
// create task list for each note
noteList.forEach(path => {
    dv.taskList(query.where(q => q.path === path));
});
// add class to div containing the task list
dv.container.querySelectorAll(':scope > div').forEach(div => div.addClass('open-tasks-view'));
```

# Experiments

- ### [[Processes]]
  ```dataview
  LIST
  FROM #process
  SORT file.mtime.ts ASC
  LIMIT 6
  ```

- ### [[Samples]]
  ```dataview
  LIST
  FROM #sample
  SORT file.mtime.ts ASC
  LIMIT 6
  ```

- ### [[Analyses]]
  ```dataview
  LIST
  FROM #analysis 
  SORT file.mtime.ts ASC
  LIMIT 6
  ```

# Resources

- ### [[Chemicals]]
  ```dataview
  LIST
  FROM #chemical
  SORT file.mtime.ts ASC
  LIMIT 6
  ```

- ### [[Devices]]
  ```dataview
  LIST
  FROM #device 
  SORT file.mtime.ts ASC
  LIMIT 6
  ```

- ### [[Instruments]]
  ```dataview
  LIST
  FROM #analysis 
  SORT file.mtime.ts ASC
  LIMIT 6
  ```

# Quick Links

- ### [[Lists]]
	- [[Processes]]
	- [[Samples]]
	- [[Analyses]]
	- [[Chemicals]]
	- [[Devices]]
	- [[Instruments]]

- ### Literature
	 - [[Books]]
	 - [[Publications]]

- ### [[Notes]]
  ```dataview
  LIST
  FROM "Notes" AND !"assets"
  WHERE note-type != "tutorial"
  SORT file.mtime.ts ASC
  LIMIT 6
  ```

- ### Tutorials
   - [[Obsidian ELN - Getting started]]
   ```dataview
        LIST
        FROM "Notes"
        WHERE note-type = "tutorial"
        SORT file.mtime.ts ASC
        LIMIT 4
   ``` 

- ### Miscellaneous
	 - [[Electrochemical Glossary]]
	 - [[Conferences]]


# Recently Edited

- 
  ```dataviewjs
    dv.list(dv.pages('').sort(f=>f.file.mtime.ts,"desc").slice(0, 5).file.link)
   ```

- 
  ```dataviewjs
    dv.list(dv.pages('').sort(f=>f.file.mtime.ts,"desc").slice(5, 10).file.link)
   ```

- 
  ```dataviewjs
    dv.list(dv.pages('').sort(f=>f.file.mtime.ts,"desc").slice(10, 15).file.link)
   ```



# Vault Info

- ### 〽️ Stats
	-  File Count: **`$=dv.pages().length`**
	-  Number of Samples: **`$=dv.pages('#sample AND !"assets"').length`**
	-  Number of Analsyes: **`$=dv.pages('#analysis AND !"assets"').length`**
	-  Number of Processes: **`$=dv.pages('#process AND !"assets"').length`**


