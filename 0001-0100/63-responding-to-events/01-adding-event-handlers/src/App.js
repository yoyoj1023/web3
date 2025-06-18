export default function Button() {
  function handleClick() {
    alert('You clicked me!');
  }

  return (
    <>
      <button onClick={handleClick}>
        Click me
      </button>

      <button onClick={function handleClick() {
        alert('You clicked me!');
      }}>
        Click me too
      </button>

      <button onClick={() => {
        alert('You clicked me!');
      }}>
        Click me three
      </button>
    </>
  );
}
