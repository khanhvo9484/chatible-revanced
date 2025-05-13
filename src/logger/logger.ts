import { createLogger, transports, format } from "winston";
import chalk from "chalk";

export const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
      const levelColor =
        {
          info: chalk.blue,
          warn: chalk.yellow,
          error: chalk.red,
          debug: chalk.green,
        }[level] || chalk.white;

      return `${chalk.gray(timestamp)} [${levelColor(level)}]: ${message}`;
    })
  ),
  transports: [new transports.Console()],
});
