/**
 * Frontend mirror of the veto sequences.
 * Used by VetoStatus to render the step timeline.
 */

/** @type {Record<string, {team: "A"|"B", action: "ban"|"pick"}[]>} */
export const VETO_SEQUENCES_META = {
  BO1: [
    { team: "A", action: "ban" }, { team: "B", action: "ban" },
    { team: "A", action: "ban" }, { team: "B", action: "ban" },
    { team: "A", action: "ban" }, { team: "B", action: "ban" },
  ],
  BO3: [
    { team: "A", action: "ban" },  { team: "B", action: "ban" },
    { team: "A", action: "pick" }, { team: "B", action: "pick" },
    { team: "A", action: "ban" },  { team: "B", action: "ban" },
  ],
  BO5: [
    { team: "A", action: "ban" },  { team: "B", action: "ban" },
    { team: "A", action: "pick" }, { team: "B", action: "pick" },
    { team: "A", action: "pick" }, { team: "B", action: "pick" },
  ],
};