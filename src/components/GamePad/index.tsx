export type OrientationType = "up" | "down" | "left" | "right";

export interface GamePadProps {
  onOrientationClick: (type: OrientationType) => void;
}

export default function GamePad(props: GamePadProps) {
  const { onOrientationClick } = props;

  return (
    <>
      <div style={{ width: "100%", marginTop: 20 }} className="flex-center">
        <button
          onClick={() => {
            onOrientationClick?.("up");
          }}
        >
          上
        </button>
      </div>

      <div style={{ width: "100%", marginTop: 10 }} className="flex-center">
        <button
          style={{ marginRight: 80 }}
          onClick={() => {
            onOrientationClick?.("left");
          }}
        >
          左
        </button>

        <button
          onClick={() => {
            onOrientationClick?.("right");
          }}
        >
          右
        </button>
      </div>

      <div style={{ width: "100%", marginTop: 10 }} className="flex-center">
        <button
          onClick={() => {
            onOrientationClick?.("down");
          }}
        >
          下
        </button>
      </div>
    </>
  );
}
