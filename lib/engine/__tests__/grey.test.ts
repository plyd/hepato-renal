import { describe, expect, it } from "vitest";
import { blackout, fromGrey, toGrey } from "../grey";
import { FLAG_BACKGROUND, FLAG_COLORED, FLAG_SATURATED } from "../types";

describe("toGrey", () => {
  it("convertit en (R+G+B)/3 et pose les drapeaux", () => {
    const px = [
      [10, 20, 30, 255], // gris 20
      [255, 255, 255, 255], // saturé
      [200, 50, 50, 255], // coloré (et gris 100)
      [0, 0, 0, 255], // fond
      [252, 252, 252, 255], // saturé (≥ 250)
      [120, 120, 121, 255], // gris ordinaire
    ];
    const rgba = new Uint8ClampedArray(px.flat());
    const img = toGrey(rgba, 6, 1);
    expect(Array.from(img.grey)).toEqual([20, 255, 100, 0, 252, 120]);
    expect(img.flags[0]).toBe(0);
    expect(img.flags[1] & FLAG_SATURATED).toBeTruthy();
    expect(img.flags[2] & FLAG_COLORED).toBeTruthy();
    expect(img.flags[2] & FLAG_SATURATED).toBeFalsy();
    expect(img.flags[3] & FLAG_BACKGROUND).toBeTruthy();
    expect(img.flags[4] & FLAG_SATURATED).toBeTruthy();
    expect(img.flags[5]).toBe(0);
  });

  it("refuse un buffer trop court", () => {
    expect(() => toGrey(new Uint8ClampedArray(8), 3, 1)).toThrow();
  });
});

describe("fromGrey / blackout", () => {
  it("pose saturé et fond depuis un tableau de gris", () => {
    const img = fromGrey(new Uint8Array([0, 4, 5, 249, 250, 255]), 6, 1);
    expect(img.flags[0] & FLAG_BACKGROUND).toBeTruthy();
    expect(img.flags[1] & FLAG_BACKGROUND).toBeTruthy();
    expect(img.flags[2]).toBe(0);
    expect(img.flags[3]).toBe(0);
    expect(img.flags[4] & FLAG_SATURATED).toBeTruthy();
    expect(img.flags[5] & FLAG_SATURATED).toBeTruthy();
  });

  it("noircit un rectangle de façon irréversible et le marque comme fond", () => {
    const img = fromGrey(new Uint8Array(25).fill(100), 5, 5);
    blackout(img, 1, 1, 3, 3);
    expect(img.grey[0]).toBe(100);
    expect(img.grey[1 * 5 + 1]).toBe(0);
    expect(img.grey[3 * 5 + 3]).toBe(0);
    expect(img.flags[2 * 5 + 2] & FLAG_BACKGROUND).toBeTruthy();
    expect(img.grey[4 * 5 + 4]).toBe(100);
  });
});
