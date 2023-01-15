type Props = { price: number };
export const Glasses = (props: Props) => (
  <div className="m-2 max-w-md rounded-2xl p-10 shadow-lg">
    <img
      className="rounded-2xl shadow-md transition-transform hover:scale-95"
      src="/glasses.jpg"
      alt={"Image of glasses"}
    ></img>
    <p className="my-4 text-2xl">
      <b>Pris:</b> {props.price},-
    </p>
  </div>
);
