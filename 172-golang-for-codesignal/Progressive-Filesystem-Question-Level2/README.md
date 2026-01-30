### Requirements

Your task is to implement a simple container of integer numbers. Plan your design according to the level specifications below:

- Level 1: Container should support adding and removing numbers.

- Level 2: Container should support getting the median of the numbers stored in it.

To move to the next level, you need to pass all the tests at this level when submitting the solution.

### Level 2
Container should support calculating the median of the numbers stored in it.

- GetMedian() *int — should return the median integer - the integer in the middle of the sequence after all integers stored in the container are sorted in ascending order. If the length of the sequence is even, the leftmost integer from the two middle integers should be returned. If the container is empty, this method should return nil.

### Examples
The example below shows how these operations should work (the section is scrollable to the right):

Queries | Explanations
GetMedian() | returns nil; container state: []
Add(5) | returns 1; container state: [5]
Add(10) | returns 2; container state: [5, 10]
Add(1) | returns 3; container state: [5, 10, 1]
GetMedian() | returns 5; sorted sequence of container numbers is: [1, 5, 10]
Add(4) | returns 4; container state: [5, 10, 1, 4]
GetMedian() | returns 4; sorted sequence of container numbers is: [1, 4, 5, 10]
Delete(1) | returns true; container state: [5, 10, 4]
GetMedian() | returns 5; sorted sequence of container numbers is: [4, 5, 10]


+ [execution time limit] 40 seconds

+ [memory limit] 4g


