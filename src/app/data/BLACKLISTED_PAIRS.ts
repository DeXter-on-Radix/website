/*
 * This file contains all alphadex trade pairs that are
 * blacklisted on DEXTER. Blacklisting of trade pairs requires
 * either a vote by the DEXTER community or technical reasons
 * (e.g. token migration)
 */

export const BLACKLISTED_PAIRS: string[] = [
  // WOWO/XRD: Due to token migration the old WOWO token is now deprecated
  "component_rdx1cr4urwgxap6xvyjlnudg08sk9t2gsdqrxh9mvetxs8kqlcyxh07qd3",
];
