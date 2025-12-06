import classNames from "classnames";

export function NumberOnline(props: { count: number }) {
  return (
    <div className="number-online">
      <div
        className={classNames("dot", {
          "bg-gray": props.count == 0,
          "bg-lime": props.count > 0,
        })}
      ></div>
      {props.count} online
    </div>
  );
}
