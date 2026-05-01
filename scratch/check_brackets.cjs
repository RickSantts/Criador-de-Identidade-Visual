
const fs = require('fs');
const content = fs.readFileSync('src/App.jsx', 'utf8');
const stack = [];
const brackets = { '(': ')', '{': '}', '[': ']' };
const reverseBrackets = { ')': '(', '}': '{', ']': '[' };

for (let i = 0; i < content.length; i++) {
  const char = content[i];
  if (brackets[char]) {
    stack.push({ char, line: content.substring(0, i).split('\n').length });
  } else if (reverseBrackets[char]) {
    if (stack.length === 0) {
      console.log(`Unmatched closing bracket ${char} at line ${content.substring(0, i).split('\n').length}`);
    } else {
      const top = stack.pop();
      if (top.char !== reverseBrackets[char]) {
        console.log(`Mismatch: ${top.char} at line ${top.line} closed by ${char} at line ${content.substring(0, i).split('\n').length}`);
      }
    }
  }
}

if (stack.length > 0) {
  stack.forEach(b => console.log(`Unclosed ${b.char} at line ${b.line}`));
} else {
  console.log("Brackets are balanced!");
}
