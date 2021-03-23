import React from "react";
import CheckmarkFilled16 from "@carbon/icons-react/es/checkmark--filled/16";
import RadioButton16 from "@carbon/icons-react/es/radio-button/16";
import { switchTo } from "@openmrs/esm-framework";
import { useTranslation } from "react-i18next";
import { Form } from "../types";
import styles from "./form-view.component.scss";
import { getStartedVisit, visitItem } from "../visit/visit-utils";
import { startVisitPrompt } from "../visit/start-visit-prompt.component";
import Search from "carbon-components-react/es/components/Search";
import debounce from "lodash-es/debounce";
import isEmpty from "lodash-es/isEmpty";
import EmptyDataIllustration from "../../ui-components/empty-state/empty-data-illustration.component";
import { Tile } from "carbon-components-react/es/components/Tile";
import paginate from "../../utils/paginate";
import PatientChartPagination from "../../ui-components/pagination/pagination.component";

interface FormViewProps {
  forms: Array<Form>;
  patientUuid: string;
  encounterUuid?: string;
}

interface EmptyFormViewProps {
  action: string;
}
interface checkBoxProps {
  label: string;
  form: Form;
}

const filterFormsByName = (formName: string, forms: Array<Form>) => {
  return forms.filter(
    form => form.name.toLowerCase().search(formName.toLowerCase()) !== -1
  );
};

const EmptyFormView: React.FC<EmptyFormViewProps> = ({ action }) => {
  const { t } = useTranslation();

  return (
    <Tile light className={styles.formTile}>
      <EmptyDataIllustration />
      <p className={styles.content}>
        {t("noFormsFound", "Sorry, no forms have been found")}
      </p>
      <p className={styles.action}>{action}</p>
    </Tile>
  );
};

const FormView: React.FC<FormViewProps> = ({
  forms,
  patientUuid,
  encounterUuid
}) => {
  const { t } = useTranslation();
  const [activeVisit, setActiveVisit] = React.useState<visitItem>();
  const [searchTerm, setSearchTerm] = React.useState<string>(null);
  const [allForms, setAllForms] = React.useState<Array<Form>>(forms);
  const [pageNumber, setPageNumber] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(8);
  const [currentPage, setCurrentPage] = React.useState([]);

  const handleSearch = debounce(searchTerm => {
    setSearchTerm(searchTerm);
  }, 300);

  const handlePageChange = ({ page }) => {
    setPageNumber(page);
  };

  React.useEffect(() => {
    if (!isEmpty(allForms)) {
      const [page, allPages] = paginate<any>(allForms, pageNumber, pageSize);
      setCurrentPage(page);
    }
  }, [allForms, pageNumber, pageSize]);

  React.useEffect(() => {
    const updatedForms = !isEmpty(searchTerm)
      ? filterFormsByName(searchTerm, forms)
      : forms;
    setAllForms(updatedForms);
  }, [searchTerm, forms]);

  const launchFormEntry = form => {
    if (activeVisit) {
      const url = `/patient/${patientUuid}/formentry`;
      switchTo("workspace", url, {
        title: t("formEntry", `${form.name}`),
        formUuid: form.uuid,
        encounterUuid: encounterUuid
      });
    } else {
      startVisitPrompt();
    }
  };

  React.useEffect(() => {
    const sub = getStartedVisit.subscribe(visit => {
      setActiveVisit(visit);
    });
    return () => sub.unsubscribe();
  }, []);

  const CheckedComponent: React.FC<checkBoxProps> = ({ label, form }) => {
    return (
      <div
        tabIndex={0}
        role="button"
        onClick={() => launchFormEntry(form)}
        className={styles.customCheckBoxContainer}
      >
        {form.complete ? <CheckmarkFilled16 /> : <RadioButton16 />}
        <div className={styles.label}>{label}</div>
      </div>
    );
  };

  return (
    <div className={styles.formContainer}>
      {isEmpty(currentPage) ? (
        <EmptyFormView
          action={t(
            "emptyFormHint",
            "The patient does not have a completed form, try complete a form"
          )}
        />
      ) : (
        <>
          <Search
            id="searchInput"
            labelText=""
            className={styles.formSearchInput}
            placeholder={t("searchForForm", "Search for a form")}
            onChange={evnt => handleSearch(evnt.target.value)}
          />
          <>
            {!isEmpty(searchTerm) && !isEmpty(allForms) && (
              <p className={styles.formResultsLabel}>
                {allForms.length} {t("matchFound", "match found")}
              </p>
            )}
            {isEmpty(allForms) && !isEmpty(searchTerm) && (
              <EmptyFormView
                action={t(
                  "formSearchHint",
                  "Try searching for the form using an alternative name or keyword"
                )}
              />
            )}
            <div className={styles.formCheckBoxContainer}>
              {currentPage.map((form, index) => (
                <CheckedComponent key={index} label={form.name} form={form} />
              ))}

              <PatientChartPagination
                items={allForms}
                onPageNumberChange={handlePageChange}
                pageNumber={pageNumber}
                pageSize={pageSize}
                pageUrl="forms"
                currentPage={currentPage}
              />
            </div>
          </>
        </>
      )}
    </div>
  );
};

export default FormView;
