package integercontainer

import (
	"github.com/stretchr/testify/require"
	"testing"
)

// The test class below includes 10 tests for Level 1.
//
// All have the same score.
// You are not allowed to modify this file, but feel free to read the source code to better understand what is happening in every specific case.
func TestLevel1(t *testing.T) {

	var container IntegerContainer

	t.Run("test level 1 case 01 add two numbers", func(t *testing.T) {
		container = NewIntegerContainerImpl()
		require.Equal(t, 1, container.Add(10))
		require.Equal(t, 2, container.Add(100))
	})

	t.Run("test level 1 case 02 add many numbers", func(t *testing.T) {
		container = NewIntegerContainerImpl()
		require.Equal(t, 1, container.Add(10))
		require.Equal(t, 2, container.Add(9))
		require.Equal(t, 3, container.Add(8))
		require.Equal(t, 4, container.Add(7))
		require.Equal(t, 5, container.Add(6))
		require.Equal(t, 6, container.Add(5))
		require.Equal(t, 7, container.Add(4))
		require.Equal(t, 8, container.Add(3))
		require.Equal(t, 9, container.Add(2))
		require.Equal(t, 10, container.Add(1))
	})

	t.Run("test level 1 case 03 delete number", func(t *testing.T) {
		container = NewIntegerContainerImpl()
		require.Equal(t, 1, container.Add(10))
		require.Equal(t, 2, container.Add(100))
		require.True(t, container.Delete(10))
	})

	t.Run("test level 1 case 04 delete nonexisting number", func(t *testing.T) {
		container = NewIntegerContainerImpl()
		require.Equal(t, 1, container.Add(10))
		require.Equal(t, 2, container.Add(100))
		require.False(t, container.Delete(20))
		require.True(t, container.Delete(10))
		require.False(t, container.Delete(10))
	})

	t.Run("test level 1 case 05 add and delete same numbers", func(t *testing.T) {
		container = NewIntegerContainerImpl()
		require.Equal(t, 1, container.Add(10))
		require.Equal(t, 2, container.Add(10))
		require.Equal(t, 3, container.Add(10))
		require.Equal(t, 4, container.Add(10))
		require.Equal(t, 5, container.Add(10))
		require.True(t, container.Delete(10))
		require.True(t, container.Delete(10))
		require.True(t, container.Delete(10))
		require.True(t, container.Delete(10))
		require.True(t, container.Delete(10))
		require.False(t, container.Delete(10))
		require.False(t, container.Delete(10))
	})

	t.Run("test level 1 case 06 add delete several times", func(t *testing.T) {
		container = NewIntegerContainerImpl()
		require.Equal(t, 1, container.Add(555))
		require.True(t, container.Delete(555))
		require.False(t, container.Delete(555))
		require.Equal(t, 1, container.Add(555))
		require.True(t, container.Delete(555))
		require.False(t, container.Delete(555))
	})

	t.Run("test level 1 case 07 delete in random order", func(t *testing.T) {
		container = NewIntegerContainerImpl()
		require.Equal(t, 1, container.Add(10))
		require.Equal(t, 2, container.Add(20))
		require.Equal(t, 3, container.Add(30))
		require.Equal(t, 4, container.Add(40))
		require.Equal(t, 5, container.Add(40))
		require.True(t, container.Delete(30))
		require.False(t, container.Delete(30))
		require.True(t, container.Delete(10))
		require.False(t, container.Delete(10))
		require.True(t, container.Delete(40))
		require.True(t, container.Delete(40))
		require.False(t, container.Delete(40))
		require.True(t, container.Delete(20))
		require.False(t, container.Delete(20))
	})

	t.Run("test level 1 case 08 delete before add", func(t *testing.T) {
		container = NewIntegerContainerImpl()
		require.False(t, container.Delete(1))
		require.False(t, container.Delete(2))
		require.False(t, container.Delete(3))
		require.Equal(t, 1, container.Add(1))
		require.Equal(t, 2, container.Add(2))
		require.Equal(t, 3, container.Add(3))
		require.True(t, container.Delete(3))
		require.True(t, container.Delete(2))
		require.True(t, container.Delete(1))
		require.False(t, container.Delete(3))
		require.False(t, container.Delete(2))
		require.False(t, container.Delete(1))
	})

	t.Run("test level 1 case 09 mixed operation 1", func(t *testing.T) {
		container = NewIntegerContainerImpl()
		require.Equal(t, 1, container.Add(10))
		require.Equal(t, 2, container.Add(15))
		require.Equal(t, 3, container.Add(20))
		require.Equal(t, 4, container.Add(10))
		require.Equal(t, 5, container.Add(5))
		require.True(t, container.Delete(15))
		require.True(t, container.Delete(20))
		require.False(t, container.Delete(20))
		require.False(t, container.Delete(0))
		require.Equal(t, 4, container.Add(7))
		require.Equal(t, 5, container.Add(9))
		require.True(t, container.Delete(7))
		require.True(t, container.Delete(10))
		require.True(t, container.Delete(10))
		require.False(t, container.Delete(10))
		require.False(t, container.Delete(100))
	})

	t.Run("test level 1 case 10 mixed operation 2", func(t *testing.T) {
		container = NewIntegerContainerImpl()
		require.False(t, container.Delete(6))
		require.Equal(t, 1, container.Add(100))
		require.False(t, container.Delete(200))
		require.Equal(t, 2, container.Add(500))
		require.False(t, container.Delete(0))
		require.Equal(t, 3, container.Add(300))
		require.False(t, container.Delete(1000))
		require.Equal(t, 4, container.Add(400))
		require.True(t, container.Delete(300))
		require.True(t, container.Delete(400))
		require.True(t, container.Delete(100))
		require.True(t, container.Delete(500))
		require.Equal(t, 1, container.Add(1000))
		require.Equal(t, 2, container.Add(100))
		require.Equal(t, 3, container.Add(10))
		require.Equal(t, 4, container.Add(1))
		require.True(t, container.Delete(100))
		require.False(t, container.Delete(500))
		require.False(t, container.Delete(300))
		require.False(t, container.Delete(400))
	})
}
