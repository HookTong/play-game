import { MoveType } from ".";
import { log2TakeEle, randomTakeEle } from "../../utils/array";

/**
 * 线性合并(核心算法函数)
 * 一维数组向左合并([2, 2, 0, 4]==>[4, 4, 0, 0])
 * @param {Array<number>} line 一维数组
 */
const lineMerge = (line: Array<number> = []) => {
  // 元素是否产生变化
  let isChange = false;
  for (let i = 0; i < line.length; i++) {
    // 当前元素
    if (i === line.length - 1) break;
    for (let n = i + 1; n < line.length; n++) {
      // 下一元素
      let ok = false;
      if (line[i] === 0) {
        // 当前元素为0
        if (line[n] !== 0) {
          // 下一元素不为0，则交换位置
          line[i] = line[n];
          line[n] = 0;
          isChange = true;
        }
      } else {
        // 当前元素不为0
        if (line[i] === line[n]) {
          // 当前元素与下一个元素相等则执行合并
          line[i] = line[i] + line[n];
          line[n] = 0;
          ok = true;
          isChange = true;
        } else if (line[n] !== 0) {
          ok = true;
        }
      }
      if (ok) break;
    }
  }
  return { line, isChange };
};

/**
 * 宫格元素移动(前置算法函数)
 * 该函数将二维数组拆分为多个一维数组，并执行线性合并(lineMerge(line))
 * @param {Array} table 宫格
 * @param {'up'|'down'|'left'|'right'} type 移动方向
 */
export const move = (
  table: Array<Array<number>> = [[]],
  type: MoveType = "up"
) => {
  const rowSize = table.length;
  const colSize = table[0].length;
  // 宫格是否变化
  let isChange = false;
  // 移动处理器
  const handler = {
    up: () => {
      for (let i = 0; i < colSize; i++) {
        const res = [];
        // 获取要操作的一条线
        for (let j = 0; j < rowSize; j++) {
          res.push(table[j][i]);
        }
        const { line: newRes, isChange: change } = lineMerge(res);
        for (let j = 0; j < rowSize; j++) {
          table[j][i] = newRes[j];
        }
        if (change) {
          isChange = true;
        }
      }
    },
    down: () => {
      for (let i = 0; i < colSize; i++) {
        const res = [];
        // 获取要操作的一条线
        for (let j = rowSize - 1; j > -1; j--) {
          res.push(table[j][i]);
        }
        const { line: newRes, isChange: change } = lineMerge(res);
        for (let j = rowSize - 1; j > -1; j--) {
          table[j][i] = newRes[rowSize - 1 - j];
        }
        if (change) {
          isChange = true;
        }
      }
    },
    left: () => {
      for (let i = 0; i < rowSize; i++) {
        const res = [];
        // 获取要操作的一条线
        for (let j = 0; j < colSize; j++) {
          res.push(table[i][j]);
        }
        const { line: newRes, isChange: change } = lineMerge(res);
        for (let j = 0; j < colSize; j++) {
          table[i][j] = newRes[j];
        }
        if (change) {
          isChange = true;
        }
      }
    },
    right: () => {
      for (let i = 0; i < rowSize; i++) {
        const res = [];
        // 获取要操作的一条线
        for (let j = colSize - 1; j > -1; j--) {
          res.push(table[i][j]);
        }
        const { line: newRes, isChange: change } = lineMerge(res);
        for (let j = colSize - 1; j > -1; j--) {
          table[i][j] = newRes[colSize - 1 - j];
        }
        if (change) {
          isChange = true;
        }
      }
    },
  };
  handler[type]?.();
  return { table, isChange };
};

/**
 * 插入新元素
 * @param {Array<Array<number>>} table
 */
export const insertElement = (
  table: Array<Array<number>> = [[]],
  randomValues?: Array<number>
) => {
  // 宫格随机数可选值
  const optionalValues =
    Array.isArray(randomValues) && randomValues.length
      ? randomValues
      : [2, 4, 8];
  const rowSize = table.length;
  const colSize = table[0].length;
  const keys = [];
  for (let i = 0; i < rowSize; i++) {
    for (let j = 0; j < colSize; j++) {
      if (table[i][j] === 0) {
        keys.push(`${i}-${j}`);
      }
    }
  }
  const [rowIndex, colIndex] =
    keys[Math.floor(Math.random() * keys.length)].split("-");
  table[Number(rowIndex)][Number(colIndex)] = randomTakeEle(optionalValues);
  return table;
};

/**
 * 初始化表格元素
 * @param {Number} rowSize 行数
 * @param {Number} colSize 列数
 * @param {Number} randomNumberSize 随机数个数
 */
export const initTable = (
  rowSize: number = 4,
  colSize: number = 4,
  randomNumberSize: number = 3,
  randomValues?: Array<number>
) => {
  const rSize = parseInt(String(rowSize ?? 4), 10);
  const cSize = parseInt(String(colSize ?? 4), 10);
  const rnSize = parseInt(String(randomNumberSize ?? 3), 10);
  const defTable = Array(rSize)
    .fill(undefined)
    .map(() => Array(cSize).fill(0));
  const minNumber = Math.min(rSize * cSize, rnSize);
  for (let i = 0; i < minNumber; i++) {
    insertElement(defTable, randomValues);
  }
  return defTable;
};

/** 宫格数据复制 */
export const copyTable = (table: Array<Array<number>>) => {
  return [...table].map((v) => [...v]);
};

/**
 * 判断是否游戏结束
 * @param {Array<Array<number>>} table 表格数据
 */
export const isTableEnd = (table: Array<Array<number>> = [[]]) => {
  // 宫格副本
  const copy = copyTable(table);
  const { isChange: uChange } = move(copy, "up");
  if (uChange) return false;
  const { isChange: dChange } = move(copy, "down");
  if (dChange) return false;
  const { isChange: lChange } = move(copy, "left");
  if (lChange) return false;
  const { isChange: rChange } = move(copy, "right");
  if (rChange) return false;
  return true;
};

/**
 * 数字背景颜色
 * @param {Number} number 数字
 */
export const getTileColor = (number: number, colors?: Array<string>) => {
  // 数字颜色
  const numberColors = [
    "#eee4da", // 2
    "#ede0c8", // 4
    "#f2b179", // 8
    "#f59563", // 16
    "#f67c5f", // 32
    "#f65e3b", // 64
    "#edcf72", // 128
    "#edcc61", // 256
    "#edc850", // 512
    "#edc53f", // 1024
    "#edc22e", // 2048
    "#3c3a32", // 4096 及以上
  ];
  return log2TakeEle(
    number,
    Array.isArray(colors) && colors.length ? colors : numberColors,
    "#cdc1b4"
  );
};
