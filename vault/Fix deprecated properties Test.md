---
tags:
  - "#test1"
  - "#test2"
tag: "#test3"
alias:
  - Depri
cssclass: somecss
otherkey: bla
nested:
  key: some value
---

With the release of Obsidian 1.9, the formerly supported singular form of the special property keys for tags, aliases, and CSS classes will no longer be supported. Further, the value of those keys has to be a list. A single string value, which was previously supported, will no longer work.

You can fix the deprecated form of these special keys by clicking the **wrench button** in the nested properties editor. This will rename the no longer supported singular forms into their respective plural form and convert them into a list. In case your metadata contains both a singular and plural version of the keys, they will be merged.

Be aware that any edits of your metadata with the nested properties editor may change the formatting of your metadata. This is because internally your metadata is handled by Obsidian as a JavaScript object. If you make changes to your metadata, these changes will be applied to the JavaScript object first, which is then converted back to YAML to update your metadata. Since JavaScript objects do not support comments or different list definitions (e.g. block of flow style), those formattings may get lost. This is not an issue of the nested properties editor but due to how Obsidian's API handles the YAML metadata.