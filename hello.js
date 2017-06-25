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
          resolve(`Switched to a new branch ${branch}`)
        }

        reject(data)
      })
    })
    
  }

  async function modifyPackageJSON() {
    let checkoutResult
    try {
      checkoutResult = await checkout()
    } catch (e) {
      console.log(e.toString().trimRight().red)
      process.exit(1)
    }
    console.log('分支切换成功'.rainbow)
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
        fs.writeFile(path.resolve(process.cwd(), 'package.json'), string, (err) => {
          if (err) {
            console.log(err)
            process.exit(1)
          }
          console.log('package.json更新成功'.green)
          console.log('更新结果为:'.green)
          console.log(getModifiedPackageJSONVersion(string).green)
        })
      } else {
        console.log(`package.json必须为文件`.red)
        process.exit(1)
      }
    })
  }

  function getModifiedPackageJSONVersion(string) {
    let version = string.slice(string.indexOf(`"version"`) - 1)
    return version.slice(0, version.indexOf('\n')).trim()
  }

  function getVersion(branchName) {
    return branchName.slice(branchName.indexOf('/') + 1)
  }

  modifyPackageJSON()

})()
