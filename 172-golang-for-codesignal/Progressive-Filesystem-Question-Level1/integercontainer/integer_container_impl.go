package integercontainer

type IntegerContainerImpl struct {
	AbstractIntegerContainer
	values []int
}

func NewIntegerContainerImpl() *IntegerContainerImpl {
	IntegerContainer := IntegerContainerImpl{
		AbstractIntegerContainer{},
		make([]int, 0),
	}
	return &IntegerContainer
}

func (ic *IntegerContainerImpl) Add(value int) int {
	ic.values = append(ic.values, value)
	return len(ic.values)
}

func (ic *IntegerContainerImpl) Delete(value int) bool {
	for i, v := range ic.values {
		if v == value {
			// 刪除找到的第一個匹配項
			ic.values = append(ic.values[:i], ic.values[i+1:]...)
			return true
		}
	}
	return false
}
