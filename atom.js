#!/usr/bin/env node

const fs = require('fs');
const readline = require('readline');
const path = require('path');

class Atom {
  constructor() {
    this.files = {};
    this.currentFile = null;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  start() {
    console.log('=== Atom テキストエディタ ===');
    console.log('コマンド: open, new, list, edit, save, close, exit');
    this.showMenu();
  }

  showMenu() {
    this.rl.question('\n> ', (input) => {
      const [command, ...args] = input.trim().split(' ');
      
      switch(command) {
        case 'new':
          this.newFile(args[0]);
          break;
        case 'open':
          this.openFile(args[0]);
          break;
        case 'list':
          this.listFiles();
          break;
        case 'edit':
          this.editFile(args[0]);
          break;
        case 'save':
          this.saveFile();
          break;
        case 'close':
          this.closeFile();
          break;
        case 'exit':
          this.exit();
          return;
        default:
          console.log('不明なコマンド');
      }
      
      this.showMenu();
    });
  }

  newFile(filename) {
    if (!filename) {
      console.log('ファイル名を指定してください: new <filename>');
      return;
    }
    this.files[filename] = '';
    this.currentFile = filename;
    console.log(`新しいファイルを作成: ${filename}`);
  }

  openFile(filename) {
    if (!filename) {
      console.log('ファイル名を指定してください: open <filename>');
      return;
    }
    try {
      const content = fs.readFileSync(filename, 'utf-8');
      this.files[filename] = content;
      this.currentFile = filename;
      console.log(`ファイルを開きました: ${filename}`);
    } catch(err) {
      console.log(`ファイルが見つかりません: ${filename}`);
    }
  }

  listFiles() {
    console.log('開かれているファイル:');
    Object.keys(this.files).forEach(file => {
      const marker = file === this.currentFile ? ' (現在)' : '';
      console.log(`  - ${file}${marker}`);
    });
  }

  editFile(filename) {
    if (!filename) {
      console.log('ファイル名を指定してください: edit <filename>');
      return;
    }
    if (!(filename in this.files)) {
      console.log('ファイルが開かれていません');
      return;
    }
    this.currentFile = filename;
    console.log(`${filename} を編集中です。内容を入力してください (終了: Ctrl+D):`)
    
    const inputLines = [];
    const input = this.rl.createInterface({
      input: process.stdin,
      terminal: false
    });
    
    input.on('line', (line) => {
      inputLines.push(line);
    });
    
    input.on('close', () => {
      this.files[filename] = inputLines.join('\n');
      console.log('編集完了');
      this.showMenu();
    });
  }

  saveFile() {
    if (!this.currentFile) {
      console.log('ファイルが選択されていません');
      return;
    }
    try {
      fs.writeFileSync(this.currentFile, this.files[this.currentFile], 'utf-8');
      console.log(`${this.currentFile} を保存しました`);
    } catch(err) {
      console.log(`保存に失敗しました: ${err.message}`);
    }
  }

  closeFile() {
    if (!this.currentFile) {
      console.log('ファイルが選択されていません');
      return;
    }
    const file = this.currentFile;
    delete this.files[file];
    this.currentFile = null;
    console.log(`${file} を閉じました`);
  }

  exit() {
    console.log('Atomを終了します');
    this.rl.close();
    process.exit(0);
  }
}

const atom = new Atom();
atom.start();
