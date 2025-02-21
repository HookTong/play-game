import {
  forwardRef,
  JSX,
  ReactNode,
  Touch,
  TouchEvent,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "./style.module.css";
import {
  copyTable,
  getTileColor,
  initTable,
  insertElement,
  isTableEnd,
  move,
} from "./util";

/** 最低滑动触发量限制 */
const slidingTriggerAmountLimit = 20;
/** 本地存储key */
const localStorageKey = "game2048-table";

export type MoveType = "up" | "down" | "left" | "right";

export interface Game2048Props {
  /** 初始化宫格数据 */
  defaultTable?: Array<Array<number>>;
  /** 宫格间距 默认10px */
  gap?: number;
  /** 宫格单元格类名 */
  itemClassName?: string;
  /** 是否保存到本地(默认开启) */
  enableSave?: boolean;
  /** 随机数数组 */
  randomValues?: Array<number>;
  /** 数字颜色数组 */
  numberColors?: Array<string>;
  /** 游戏结束回调 */
  onGameEnd?: () => void;
  /** 宫格数组变更回调 */
  onTableChange?: (table: Array<Array<number>>) => void;
  /** 数字格式化 默认不格式化 */
  numberFormat?: (num: number) => JSX.Element | ReactNode;
}

export interface Game2048Ref {
  /** 更新宫格数据 */
  update: (table: Array<Array<number>>) => void;
  /** 宫格移动 */
  move: (type: MoveType) => void;
  /**
   * 重置宫格
   * @param {number} ggSize 宫格大小 必须大于等于2
   * @param {number} randomNumberSize 随机数个数 必须大于0
   * @param {Array<number>} randomValues 随机数数组
   */
  reset: (
    ggSize: number,
    randomNumberSize: number,
    randomValues?: Array<number>
  ) => Promise<boolean>;
  /** 清除本地存储 */
  clearLocalStorage: () => void;
}

const Game2048 = forwardRef<Game2048Ref, Game2048Props>((props, ref) => {
  const {
    defaultTable,
    gap = 10,
    itemClassName,
    enableSave = true,
    randomValues,
    numberColors,
    onGameEnd,
    onTableChange,
    numberFormat,
  } = props;
  const [table, setTable] = useState<Array<Array<number>>>(() => {
    const t = localStorage.getItem(localStorageKey);
    if (t) {
      try {
        const table = JSON.parse(t);
        if (Array.isArray(table)) return table;
      } catch (err) {
        console.error(err);
      }
    }
    return defaultTable ?? initTable(4, 4, 3, randomValues);
  });

  useImperativeHandle(ref, () => ({
    update(table) {
      if (Array.isArray(table)) setTable(table);
    },
    move(type) {
      moveHandler(table, type);
    },
    clearLocalStorage() {
      localStorage.removeItem(localStorageKey);
    },
    async reset(ggSize, rnSize, rVals) {
      if (
        ggSize !== null &&
        !isNaN(ggSize) &&
        ggSize >= 2 &&
        rnSize !== null &&
        !isNaN(rnSize) &&
        rnSize > 0
      ) {
        setTable(initTable(ggSize, ggSize, rnSize, rVals ?? randomValues));
        return true;
      }
      throw new Error("illegal parameter");
    },
  }));

  // 渲染宫格
  const cells = useMemo<JSX.Element[]>(() => {
    const rowSize = table?.length ?? 0; // 行数
    const colSize = table?.[0]?.length ?? 0; // 列数
    const sumColGap = (colSize - 1) * gap;
    const res = [];
    for (let i = 0; i < rowSize; i++) {
      for (let j = 0; j < colSize; j++) {
        const number = Number(table?.[i]?.[j] ?? 0);
        res.push(
          <div
            key={`${i}-${j}`}
            className={`${styles.cell} ${itemClassName ?? ""}`}
            style={{
              width: `calc(calc(100% - ${sumColGap}px) / ${colSize})`,
              aspectRatio: "1 / 1",
              backgroundColor: getTileColor(number, numberColors),
              // 不是最后一列则添加右侧边距
              marginRight: j !== colSize - 1 ? `${gap}px` : undefined,
              // 不是最后一行则添加底部边距
              marginBottom: i !== rowSize - 1 ? `${gap}px` : undefined,
            }}
          >
            {numberFormat ? numberFormat(number) : number === 0 ? null : number}
          </div>
        );
      }
    }
    return res;
  }, [gap, itemClassName, numberColors, numberFormat, table]);

  /**
   * 移动并渲染
   * @param {Array<Array<number>>} table 表格数据
   * @param {MoveType} type 移动类型
   */
  const moveHandler = useCallback(
    (table: Array<Array<number>>, type: MoveType) => {
      const { table: newTable, isChange } = move(copyTable(table), type);
      if (isChange) {
        insertElement(newTable, randomValues);
        setTable(newTable);
        // 只有产生移动才会保存到本地
        if (enableSave) {
          localStorage.setItem(localStorageKey, JSON.stringify(newTable));
        }
        // 判断是否游戏结束
        if (isTableEnd(newTable)) {
          onGameEnd?.();
        }
      } else {
        console.warn("宫格未产生变化");
      }
    },
    [enableSave, onGameEnd, randomValues]
  );

  // 滑动合并
  const touchStartRef = useRef<Touch>(null);
  const touchStartHandler = useCallback((e: TouchEvent<HTMLDivElement>) => {
    touchStartRef.current = e?.changedTouches?.[0];
  }, []);
  const touchEndHandler = useCallback(
    (e: TouchEvent<HTMLDivElement>) => {
      if (!touchStartRef.current) return;
      const { screenX: sX, screenY: sY } = touchStartRef.current;
      const { screenX: eX, screenY: eY } = e.changedTouches[0];
      const dX = sX - eX;
      const dY = sY - eY;
      if (Math.abs(dX) > Math.abs(dY)) {
        // 左右滑动
        if (Math.abs(dX) < slidingTriggerAmountLimit) return; // 滑动距离太小
        if (dX > 0) {
          // 左滑
          moveHandler(table, "left");
        } else {
          // 右滑
          moveHandler(table, "right");
        }
      } else {
        // 上下滑动
        if (Math.abs(dY) < slidingTriggerAmountLimit) return; // 滑动距离太小
        if (dY > 0) {
          // 上滑
          moveHandler(table, "up");
        } else {
          // 下滑
          moveHandler(table, "down");
        }
      }
      // 清除touchStartRef
      touchStartRef.current = null;
    },
    [moveHandler, table]
  );

  useEffect(() => {
    onTableChange?.(table);
  }, [onTableChange, table]);

  return (
    <div
      className={styles.wapper}
      onTouchStart={touchStartHandler}
      onTouchEnd={touchEndHandler}
    >
      {cells}
    </div>
  );
});

export default Game2048;
