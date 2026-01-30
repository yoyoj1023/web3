package integercontainer

// `IntegerContainer` interface.
type IntegerContainer interface {
	// Should add the specified integer `value` to the container
	// and return the number of integers in the container after the
	// addition.
	Add(value int) int
	// Should attempt to remove the specified integer `value` from
	// the container.
	// If the `value` is present in the container, remove it and
	// return `true`, otherwise, return `false`.
	Delete(value int) bool
	// Should return the median integer - the integer in the middle
	// of the sequence after all integers stored in the container are
	// sorted in ascending order. If the length is even, return the
	// leftmost integer from the two middle integers. Return nil if
	// the container is empty.
	GetMedian() *int
}

type AbstractIntegerContainer struct {
	IntegerContainer
}

func (a *AbstractIntegerContainer) Add(value int) int {
	// default implementation
	return 0;
}

func (a *AbstractIntegerContainer) Delete(value int) bool {
	// default implementation
	return false;
}

func (a *AbstractIntegerContainer) GetMedian() *int {
	// default implementation
	return nil;
}
