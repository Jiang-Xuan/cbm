Modify package.json filed version and auto add-commit when checkout new branch.
===============================================================================

新建分支的同时修改`package.json`的版本号到`daily/0.0.1`中的斜线后面的数字版本
---------------------------------------------------------------------

## Notes

**目前 node.js 版本必须在7.0以上, 需要原生支持`asyncFunction`**

### Install

```bash
npm install -g cpa
```

### Description

上面的命令会在命令行中添加命令`cbm`

### Usage

命令行中输入 `cbm daily/0.0.1`

会输出辅助信息

```
执行: 切换到新分支
checkout branch successful.
Switched to a new branch 'daily/0.0.2'
执行: 更新package.json version字段
update package.json field version successful.
更新结果为:
"version": "0.0.2",
执行: git add package.json
command `git add` execute successful.
执行:git commit -m '更新package.json的version字段'
[daily/0.0.2 5733653] 更新package.json的version字段
 1 file changed, 26 insertions(+), 26 deletions(-)
 rewrite package.json (99%)
command `git commit  -m 更新package.json的version字段` executed successful.
```
此时说明package.json中的version字段已经被更新, 并且创建了一次提交将package.json的修改提交到本地仓库, 但是并不会push到远程仓库.