export interface Stats {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
}

export const formatStats = ({ hp, atk, def, spa, spd, spe }: Stats): string => {
  return [hp, atk, def, spa, spd, spe].join(" / ");
};

export const parseStats = (s: string): Stats | undefined => {
  const [hp, atk, def, spa, spd, spe] = s
    .split("/")
    .map((s) => s.replaceAll(/\D/g, ""))
    .map((s) => Number(s));

  if ([hp, atk, def, spa, spd, spe].some((n) => Number.isNaN(n))) {
    return undefined;
  }
  return {
    hp,
    atk,
    def,
    spa,
    spd,
    spe,
  };
};
