package integercontainer

import "sort"

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

func (ic *IntegerContainerImpl) GetMedian() *int {
	if len(ic.values) == 0 {
		return nil
	}
	
	// 複製並排序數值
	sorted := make([]int, len(ic.values))
	copy(sorted, ic.values)
	sort.Ints(sorted)
	
	// 計算中位數索引
	// 如果長度是奇數，取中間的數
	// 如果長度是偶數，取左邊的中間數（較小索引）
	medianIndex := (len(sorted) - 1) / 2
	median := sorted[medianIndex]
	
	return &median
}
