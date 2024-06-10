import fs from "fs";
import { currentTime } from "../utils/datetime.js";

const CSV_HEADER = "Account,Password,Address,Private Key,Seed Phrase";

export function save(chainName, content) {
  if (!content) {
    return;
  }

  const csvContent = CSV_HEADER + "\r\n" + content;

  if (!fs.existsSync("out")) fs.mkdirSync("out");
  fs.writeFileSync(
    `out/${chainName}-wallets-${currentTime()}.csv`,
    csvContent,
    {
      encoding: "utf-8",
    }
  );
}
