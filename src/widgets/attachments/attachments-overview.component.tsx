import React, { useState, useEffect } from "react";
import { useCurrentPatient } from "@openmrs/esm-api";
import {
  getAttachments,
  createAttachment,
  deleteAttachment
} from "./attachments.resource";
import Gallery from "react-grid-gallery";
import styles from "./attachments-overview.css";
import { useTranslation } from "react-i18next";

export default function AttachmentsOverview() {
  const [attachments, setAttachments] = useState([]);
  const [currentImage, setCurrentImage] = useState(0);
  const { t } = useTranslation();

  const [
    isLoadingPatient,
    patient,
    patientUuid,
    patientErr
  ] = useCurrentPatient();

  useEffect(() => {
    if (patientUuid) {
      const abortController = new AbortController();
      getAttachments(patientUuid, true, abortController).then(
        (response: any) => {
          const listItems = response.data.results.map(attachment => ({
            id: `${attachment.uuid}`,
            src: `/openmrs/ws/rest/v1/attachment/${attachment.uuid}/bytes`,
            thumbnail: `/openmrs/ws/rest/v1/attachment/${attachment.uuid}/bytes`,
            thumbnailWidth: 320,
            thumbnailHeight: 212,
            caption: attachment.comment,
            isSelected: false
          }));
          setAttachments(listItems);
        }
      );
    }
  }, [patientUuid]);

  function handleUpload(e: React.SyntheticEvent, files: FileList | null) {
    e.preventDefault();
    e.stopPropagation();
    const abortController = new AbortController();
    if (files) {
      const attachments_tmp = attachments.slice();
      const result = Promise.all(
        Array.prototype.map.call(files, file =>
          createAttachment(patientUuid, file, file.name, abortController).then(
            (response: any) => {
              const new_attachment = {
                id: `${response.data.uuid}`,
                src: `/openmrs/ws/rest/v1/attachment/${response.data.uuid}/bytes`,
                thumbnail: `/openmrs/ws/rest/v1/attachment/${response.data.uuid}/bytes`,
                thumbnailWidth: 320,
                thumbnailHeight: 212,
                caption: response.data.comment,
                isSelected: false
              };
              attachments_tmp.push(new_attachment);
            }
          )
        )
      );
      result.then(() => setAttachments(attachments_tmp));
    }
  }

  function handleDragOver(e: React.SyntheticEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleCurrentImageChange(index: number) {
    setCurrentImage(index);
  }

  function handleImageSelect(index: number) {
    const attachments_tmp = attachments.slice();
    const attachment = attachments_tmp[index];
    if (attachment.hasOwnProperty("isSelected")) {
      attachment.isSelected = !attachment.isSelected;
    } else {
      attachment.isSelected = true;
    }
    setAttachments(attachments_tmp);
  }

  function getSelectedImages() {
    let selected = [];
    attachments.forEach((att, index) => {
      if (att.isSelected === true) {
        selected.push(att);
      }
    });
    return selected;
  }

  function deleteSelected() {
    setAttachments(attachments =>
      attachments.filter(att => att.isSelected !== true)
    );
    const selected = attachments.filter(att => att.isSelected === true);
    const abortController = new AbortController();
    const result = Promise.all(
      selected.map(att =>
        deleteAttachment(att.id, abortController).then((response: any) => {})
      )
    );
    result.then(() => {});
  }

  function handleDelete() {
    if (window.confirm("Are you sure you want to delete attachment?")) {
      const abortController = new AbortController();
      const id = attachments[currentImage].id;
      deleteAttachment(id, abortController).then((response: any) => {
        const attachments_tmp = attachments.filter(att => att.id != id);
        setAttachments(attachments_tmp);
      });
    }
  }

  return (
    <div
      className={styles.overview}
      onPaste={e => handleUpload(e, e.clipboardData.files)}
      onDrop={e => handleUpload(e, e.dataTransfer.files)}
      onDragOver={handleDragOver}
    >
      <div className={styles.upload}>
        <form>
          <label htmlFor="fileUpload" className={styles.uploadLabel}>
            {t(
              "Attach files by dragging &amp; dropping, selecting or pasting them."
            )}
          </label>
          <input
            type="file"
            id="fileUpload"
            multiple
            onChange={e => handleUpload(e, e.target.files)}
          />
        </form>
      </div>
      {getSelectedImages().length !== 0 && (
        <div className={styles.actions}>
          <button
            onClick={deleteSelected}
            className={`omrs-btn omrs-filled-action`}
          >
            {t("Delete Selected")}
          </button>
        </div>
      )}
      <Gallery
        images={attachments}
        currentImageWillChange={handleCurrentImageChange}
        customControls={[
          <button key="deleteAttachment" onClick={handleDelete}>
            {t("Delete")}
          </button>
        ]}
        onSelectImage={handleImageSelect}
      />
    </div>
  );
}
