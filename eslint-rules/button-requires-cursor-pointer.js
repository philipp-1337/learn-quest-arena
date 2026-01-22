module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Buttons must have cursor-pointer in className",
    },
    fixable: "code",
    schema: [],
  },

  create(context) {
    return {
      JSXOpeningElement(node) {
        // <button ...>
        if (node.name.name !== "button") return;

        const classAttr = node.attributes.find(
          (attr) =>
            attr.type === "JSXAttribute" &&
            attr.name.name === "className"
        );

        if (!classAttr || !classAttr.value) return;

        // Nur einfache Strings prüfen: className="..."
        if (classAttr.value.type !== "Literal") return;

        const classValue = classAttr.value.value;

        if (typeof classValue !== "string") return;
        if (classValue.includes("cursor-pointer")) return;

        context.report({
          node: classAttr,
          message: 'button elements must include "cursor-pointer" in className',
          fix(fixer) {
            return fixer.replaceText(
              classAttr.value,
              `"${classValue} cursor-pointer"`
            );
          },
        });
      },
    };
  },
};