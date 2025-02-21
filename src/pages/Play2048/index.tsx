import { useRef } from "react";
import { Game2048, Game2048Ref, GamePad } from "../../components";
function Play2048() {
  const game2048Ref = useRef<Game2048Ref>(null);
  const game2048GgSizeRef = useRef<number>(0);

  return (
    <>
      <Game2048
        gap={10}
        enableSave={true}
        randomValues={[2, 4]}
        onTableChange={(table) => {
          game2048GgSizeRef.current = table.length;
          console.warn("table change", table);
        }}
        onGameEnd={() => {
          setTimeout(() => alert("游戏结束"), 1000);
        }}
        // numberFormat={(num) => {
        //   return <span style={{ color: "red" }}>{num}</span>;
        // }}
        ref={game2048Ref}
      />

      <GamePad
        onOrientationClick={(type) => {
          game2048Ref.current?.move(type);
        }}
      />

      <div style={{ width: "100%", marginTop: 20 }} className="flex-center">
        <button
          onClick={() => {
            const ggSize = prompt(
              "请输入宫格大小(size*size):",
              String(game2048GgSizeRef.current ?? 4)
            );
            if (ggSize === null) return;
            game2048Ref.current?.reset(Number(ggSize), 3).catch((e) => {
              alert("请输入一个大于1的正整数");
              console.error("重置错误", e);
            });
          }}
        >
          重置
        </button>
      </div>
    </>
  );
}

export default Play2048;
