import { ConfigurableLink } from "@openmrs/esm-framework";
import React from "react";
import { useTranslation } from "react-i18next";

export default function({ basePath }) {
  const { t } = useTranslation();

  return (
    <ConfigurableLink
      to={`${basePath}/programs`}
      className="bx--side-nav__link"
    >
      {t("Programs", "Programs")}
    </ConfigurableLink>
  );
}
