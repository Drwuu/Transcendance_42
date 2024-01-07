import { ArgumentsHost, Catch, ExceptionFilter, Logger } from "@nestjs/common";

@Catch()
export class SafetyExceptionFilter implements ExceptionFilter {
	private readonly logger: Logger = new Logger(SafetyExceptionFilter.name);

	catch(exception: Error, host: ArgumentsHost): any {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse();

		this.logger.error(`catch: caught (previoulsy) unhandled exception ${exception}`)

		response.status(400).json({error: "zarma"});
	}
}
