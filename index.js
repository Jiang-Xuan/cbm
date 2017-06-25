#!/usr/bin/env node
require('colors')
const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')
const packagejson = require('./package.json');

(function() {
  let branch = process.argv.slice(2)[0]

  if (!branch) {
    console.log('请传入有效的分支名'.red.bold)
    process.exit(1)
  }

  function checkout() {
    return new Promise((resolve, reject) => {
      let checkout = spawn('git', ['checkout', '-b', branch])

      checkout.stdout.on('data', data => {
        resolve(data)
      })
      checkout.stderr.on('data', data => {
        // 分支切换成功之后的git的输出是标准错误输出
        if (data.indexOf(`Switched to a new branch ${branch}`)) {
          resolve(data.toString().trim())
        }

        reject(data.toString().trimRight().red)
      })
    })
    
  }

  function getModifiedPackageJSONVersion(string) {
    let version = string.slice(string.indexOf(`"version"`) - 1)
    return version.slice(0, version.indexOf('\n')).trim()
  }

  function getVersion(branchName) {
    return branchName.slice(branchName.indexOf('/') + 1)
  }

  function gitAdd() {
    return new Promise((resolve, reject) => {
      let gitadd = spawn('git', ['add', 'package.json'])
      gitadd.stdout.on('data', data => {
        resolve(data.toString())
      })

      gitadd.stderr.on('data', data => {
        reject(data.toString())
      })

      gitadd.on('close', code => {
        resolve(`close width code: ${code}`)
      })
    })
  }

  function gitCommit() {
    return new Promise((resolve, reject) => {
      let gitcommit = spawn('git', ['commit', '-m', '更新package.json的version字段'])
      gitcommit.stdout.on('data', data => {
        resolve(data.toString())
      })

      gitcommit.stderr.on('data', data => {
        reject(data.toString())
      })
    })
  }

  async function modifyPackageJSON() {
    let checkoutResult
    try {
      checkoutResult = await checkout()
    } catch (e) {
      console.log(e)
      process.exit(1)
    }
    console.log('执行: 切换分支'.black.bgWhite)
    console.log('checkout branch '.green + 'successful'.yellow)
    console.log(checkoutResult.green)

    let branchNameNumber = getVersion(branch)

    packagejson.version = branchNameNumber

    writePackageJSON(JSON.stringify(packagejson, null, '\t'))
  }

  function writePackageJSON(string) {
    fs.stat(path.resolve(process.cwd(), 'package.json'), (err, stat) => {
      if (err) {
        console.log(err)
      }

      if (stat.isFile()) {
        fs.writeFile(path.resolve(process.cwd(), 'package.json'), string, async function(err) {
          if (err) {
            console.log(err)
            process.exit(1)
          }
          console.log('执行: 更新package.json version字段'.black.bgWhite)
          console.log('update package.json field version '.green + 'successful'.yellow)
          console.log('更新结果为:'.green)
          console.log(getModifiedPackageJSONVersion(string).green)
          console.log('执行: git add package.json'.black.bgWhite)
          let gitAddResult, gitCommitResult
          try {
            gitAddResult = await gitAdd()
          } catch (e) {
            console.log('ERROR')
            console.log(e)
            process.exit(1)
          }
          console.log('command `git add` execute '.green + 'successful.'.yellow)
          console.log(`执行:git commit -m '更新package.json的version字段'`.black.bgWhite)
          try {
            gitCommitResult = await gitCommit()
          } catch (e) {
            console.log(e)
            process.exit(1)
          }
          console.log(gitCommitResult.trim())
          console.log('command `git commit  -m 更新package.json的version字段` execute '.green + 'successful.'.yellow)
        })
      } else {
        console.log(`package.json必须为文件`.red)
        process.exit(1)
      }
    })
  }

  

  modifyPackageJSON()

})()
