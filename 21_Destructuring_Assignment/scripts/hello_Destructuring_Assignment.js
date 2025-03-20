async function main() {
    // ===========================================
    // 陣列解構（Array Destructuring）
    // 傳統方式
    const arr = [1, 2, 3];
    const first1 = arr[0];
    const second1 = arr[1];
    console.log(first1, second1); // 1 2

    // 使用解構賦值
    const [first2, second2] = [1, 2, 3];
    console.log(first2, second2); // 1 2

    // 跳過元素
    const [first3, , third3] = [1, 2, 3];
    console.log(first3, third3); // 1 3

    // 預設值
    const [a, b, c = 10] = [1, 2];
    console.log(a, b, c); // 1 2 10

    // 剩餘運算符（Rest Operator）
    const [first4, ...rest4] = [1, 2, 3, 4];
    console.log(first4); // 1
    console.log(rest4); // [2, 3, 4]
    console.log("==========================================");
    // ===========================================
    // 物件解構（Object Destructuring）
    // 傳統方式
    const person = { name: "Alice", age: 25 };
    const name1 = person.name;
    const age1 = person.age;
    console.log(name1, age1); // Alice 25

    // 使用解構賦值
    const { name2, age2 } = { name2: "Alice", age2: 25 };
    console.log(name2, age2); // Alice 25

    // 自訂變數名稱
    const { name: userName1, age: userAge1 } = { name: "Alice", age: 25 };
    console.log(userName1, userAge1); // Alice 25

    // 預設值
    const { name3, age3, city = "Taipei" } = { name3: "Alice", age3: 25 };
    console.log(name3, age3, city); // Alice 25 Taipei

    // 剩餘運算符（Rest Operator）
    const { name4, ...rest5 } = { name4: "Alice", age4: 25, city4: "Taipei" };
    console.log(name4); // Alice
    console.log(rest5); // { age: 25, city: "Taipei" }
    console.log("==========================================");
    // ===========================================
    // 巢狀解構（Nested Destructuring）
    // 陣列巢狀解構
    const nested = [1, [2, 3], 4];
    const [a6, [b6, c6], d6] = nested;
    console.log(a6, b6, c6, d6); // 1 2 3 4

    // 物件巢狀解構
    const user = {
        id7: 1,
        info7: { name7: "Alice", age7: 25 }
      };
      const { id7, info7: { name7, age7 } } = user;
      console.log(id7, name7, age7); // 1 Alice 25
      console.log("==========================================");
    // ===========================================
    // 函數參數解構（Function Parameter Destructuring）
    function greet({ name, age }) {
        console.log(`Hello, ${name}! You are ${age} years old.`);
      }
      greet({ name: "Alice", age: 25 }); // Hello, Alice! You are 25 years old.

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});