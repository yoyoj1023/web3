### Requirements

Your task is to implement a simple container of integer numbers. Plan your design according to the level specifications below:

- Level 1: Container should support adding and removing numbers.

- Level 2: Container should support getting the median of the numbers stored in it.
To move to the next level, you need to pass all the tests at this level when submitting the solution.

### Level 1
Implement two operations for adding and removing numbers from the container. Initially, the container is empty.

- Add(value int) int — should add the specified integer value to the container and return the number of integers in the container after the addition.

- Delete(value int) bool — should attempt to remove the specified integer value from the container. If the value is present in the container, remove it and return true, otherwise, return false.

### Examples
The example below shows how these operations should work (the section is scrollable to the right):

Queries | Explanations
Add(5) | returns 1; container state: [5]
Add(10) | returns 2; container state: [5, 10]
Add(5) | returns 3; container state: [5, 10, 5]
Delete(10) | returns true; container state: [5, 5]
Delete(1) | returns false; container state: [5, 5]
Add(1) | returns 3; container state: [5, 5, 1]
 


+ [execution time limit] 40 seconds

+ [memory limit] 4g


