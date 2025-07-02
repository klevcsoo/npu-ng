import Handlebars from "handlebars";

export function compileTemplate(name: string, args?: Record<string, any>): string {
    const compiled = __TEMPLATES__[name];
    const template = Handlebars.template(compiled);
    return template(args);
}
