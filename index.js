/** 浮点数计算
 * @param {number[]} numbers  需要计算的浮点数数组
 * @param {'add' | 'sub'} type  是加还是减
 * @param {boolean} needFix 是否保留小数
 * @return {number}
 */
export function decimalCalc(
  numbers: number[],
  type?: "add" | "sub",
  needFix?: boolean
) {
  let decimal_length_max = 0;
  numbers.forEach((num) => {
    let tmp;
    try {
      tmp = num.toString().split(".")[1].length;
    } catch (e) {
      tmp = 0;
    }
    decimal_length_max = Math.max(decimal_length_max, tmp);
  });
  const decimal_length_power = Math.pow(10, decimal_length_max);
  let result = 0;
  const flag = { add: 1, sub: -1 }[type || "add"];
  numbers.forEach((num, inx) => {
    if (inx === 0) {
      result = num * decimal_length_power;
    } else {
      result = result + num * decimal_length_power * flag;
    }
  });
  result = result / decimal_length_power;
  return needFix ? +result.toFixed(decimal_length_max) : Math.round(result);
}

/** 标准化数值，使其不超出指定范围
 *  未超出返回原值，否则返回超出的边界值
 * @param {number} val
 * @param {number} max 最大边界值，默认正无穷 Infinity
 * @param {number} min 最小边界值，默认负无穷 -Infinity
 * @return {*}
 */
export function standardNum(val: number, max?: number, min?: number) {
  const maxVal = typeof max === "undefined" ? Infinity : max;
  const minVal = typeof min === "undefined" ? -Infinity : min;
  return val > maxVal ? maxVal : val < minVal ? minVal : val;
}

/** 将有效值组合成字符串
 * @param {array} data 需要组合的值数组
 * @param {string} flag 占位符，默认" "
 * @return {*}
 */
function validToString(data: any[], flag?: string) {
  return data.filter((e) => !!e).join(flag || " ");
}

/** 获取指定 ImageData 在 canvas 上的位置信息
 * @param {HTMLCanvasElement} can
 * @param {ImageData} target
 * @return {*}
 */
export function getImageDataPos(can: HTMLCanvasElement, target: ImageData) {
  const context = can.getContext("2d");
  const origin = context?.getImageData(0, 0, can.width, can.height);
  const origin_str = origin?.data.join(",") || "";
  // 目标每行的数据长度
  const target_line_length = 4 * target.width;
  // 目标第一行的数据
  //   const target_line_0 = target.data.slice(0, target_line_length).join(",");

  function getLeftTop(
    origin_str: string,
    target: ImageData,
    initial_inx: number = 0
  ): number {
    const first_line_index = origin_str.indexOf(
      target.data.slice(0, target_line_length).join(",")
    );
    // 源数据中找不到目标第一行数据时，没必要再查找了，直接返回
    if (first_line_index < 0) return -1;

    // left_top_index ：目标左上角像素索引值，l ：表示目标当前所在行
    let left_top_index = 0,
      matched_line = -1;
    // 遍历目标所有行
    for (let l = 0; l < target.height; l++) {
      // 目标第 l 行的数据
      const target_line_l = target.data
        .slice(l * target_line_length, target_line_length)
        .join(",");

      if (l === 0) {
        // 从源数据字符串中截取 [第一个 〜 目标数据第一行的前一个] 字符串，并删除结尾处的","
        // 再将字符串拆分成数组，将得到的数组长度 / 4 ，表示目标左上角像素所在位置
        left_top_index =
          origin_str.substr(0, first_line_index).replace(/,$/, "").split(",")
            .length / 4;
      } else {
        if (
          origin_str
            .split(",")
            .slice(left_top_index + l * target_line_length, target_line_length)
            .join(",") !== target_line_l
        )
          break;
      }
      // 匹配成功的行数 赋给变量
      matched_line = l;
    }
    // 当前行 !== 目标的高度 - 1 表示没有匹配到最后一行，则匹配不完整
    if (matched_line !== target.height - 1) {
      return getLeftTop(
        origin_str.substring(left_top_index + target_line_length),
        target,
        left_top_index + initial_inx
      );
    } else {
      return left_top_index + initial_inx;
    }
  }

  // 目标左上角所在像素点的索引号
  const target_pixel_index = getLeftTop(origin_str, target);
  // origin_str
  //   .substr(0, origin_str.indexOf(target_line_0))
  //   .replace(/,$/, "")
  //   .split(",").length / 4;
  if (target_pixel_index < 0) return null;
  const target_x = ~~(target_pixel_index / can.width);
  const target_y = target_pixel_index % can.width;
  return {
    x: target_x,
    y: target_y,
    width: target.width,
    height: target.height,
  };
}
window.myFn = getImageDataPos;
