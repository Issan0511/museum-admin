"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getImageUrl, hasImageSupport } from "@/lib/imageUtils";

type Row = Record<string, any>;

type TableRowEditorProps = {
  tableName: string;
  columns: string[];
  primaryKey: string;
  initialValues: Row;
  mode: "create" | "edit";
  primaryValue?: string | number | null;
};

function buildInitialValues(columns: string[], initialValues: Row) {
  return columns.reduce<Row>((acc, column) => {
    acc[column] = initialValues[column] ?? "";
    return acc;
  }, {});
}

export default function TableRowEditor({
  tableName,
  columns,
  primaryKey,
  initialValues,
  mode,
  primaryValue,
}: TableRowEditorProps) {
  const router = useRouter();
  const sortedColumns = useMemo(() => {
    const unique = Array.from(new Set(columns));
    if (!unique.includes(primaryKey)) {
      unique.unshift(primaryKey);
    }
    return unique;
  }, [columns, primaryKey]);
  const [values, setValues] = useState<Row>(() =>
    buildInitialValues(sortedColumns, initialValues)
  );
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageExists, setImageExists] = useState<boolean | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageRefreshKey, setImageRefreshKey] = useState(0);

  const hasImage = hasImageSupport(tableName);
  const imageUrl = hasImage && primaryValue && 
    (typeof primaryValue === 'string' || typeof primaryValue === 'number')
    ? getImageUrl(tableName, primaryValue)
    : null;

  // デバッグ用ログ
  useEffect(() => {
    console.log('TableRowEditor - Debug Info:', {
      tableName,
      primaryValue,
      hasImage,
      imageUrl,
    });
  }, [tableName, primaryValue, hasImage, imageUrl]);

  const handleChange = (column: string, value: string) => {
    setValues((prev) => ({
      ...prev,
      [column]: value,
    }));
  };

  useEffect(() => {
    setValues(buildInitialValues(sortedColumns, initialValues));
  }, [initialValues, sortedColumns]);

  // 画像の存在チェック
  useEffect(() => {
    if (!imageUrl) {
      setImageExists(false);
      return;
    }

    const img = new Image();
    img.onload = () => setImageExists(true);
    img.onerror = () => setImageExists(false);
    img.src = imageUrl;
  }, [imageUrl, imageRefreshKey]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      const method = mode === "create" ? "POST" : "PUT";
      const payload = {
        primaryKey,
        primaryValue,
        values,
      };

      const response = await fetch(`/api/tables/${tableName}`, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.error ?? response.statusText);
      }

      const { data } = await response.json();

      setMessage("保存しました。");
      setValues(buildInitialValues(sortedColumns, data ?? values));

      if (mode === "create" && data && data[primaryKey] !== undefined) {
        const newPrimaryValue = data[primaryKey];
        router.replace(
          `/${tableName}/${encodeURIComponent(String(newPrimaryValue))}`
        );
        router.refresh();
      } else {
        router.refresh();
      }
    } catch (submitError) {
      console.error(submitError);
      setError(
        submitError instanceof Error
          ? submitError.message
          : "エラーが発生しました。"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (primaryValue === undefined || primaryValue === null) {
      setError(`${primaryKey} が見つからないため削除できません。`);
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`/api/tables/${tableName}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ primaryKey, primaryValue }),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.error ?? response.statusText);
      }

      setMessage("削除しました。");
      router.replace(`/${tableName}`);
      router.refresh();
    } catch (deleteError) {
      console.error(deleteError);
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "エラーが発生しました。"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 画像ファイルかチェック
      if (!file.type.startsWith('image/')) {
        setError('画像ファイルを選択してください');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedFile || !primaryValue) {
      setError('ファイルが選択されていません');
      return;
    }

    setIsUploadingImage(true);
    setMessage(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('primaryValue', String(primaryValue));

      const response = await fetch(`/api/tables/${tableName}/image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.error ?? response.statusText);
      }

      const result = await response.json();
      setMessage(result.message || '画像をアップロードしました');
      setSelectedFile(null);
      setImageExists(true);
      setImageRefreshKey(prev => prev + 1); // 画像を再読み込み
      
      // ファイル入力をリセット
      const fileInput = document.getElementById('image-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (uploadError) {
      console.error(uploadError);
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : '画像のアップロードに失敗しました'
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleImageDelete = async () => {
    if (!primaryValue) {
      setError('主キーの値が見つかりません');
      return;
    }

    if (!confirm('画像を削除してもよろしいですか？')) {
      return;
    }

    setIsUploadingImage(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`/api/tables/${tableName}/image`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ primaryValue }),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.error ?? response.statusText);
      }

      const result = await response.json();
      setMessage(result.message || '画像を削除しました');
      setImageExists(false);
      setImageRefreshKey(prev => prev + 1);
    } catch (deleteError) {
      console.error(deleteError);
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : '画像の削除に失敗しました'
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <div className="space-y-6">
      {hasImage && mode === "edit" && primaryValue && (
        <div className="rounded border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-slate-500">
            画像管理
          </h3>
          
          {/* デバッグ情報 */}
          <div className="mb-4 rounded bg-slate-50 p-3 text-xs text-slate-600">
            <p><strong>テーブル名:</strong> {tableName}</p>
            <p><strong>主キーの値:</strong> {String(primaryValue)}</p>
            <p><strong>画像サポート:</strong> {hasImage ? 'あり' : 'なし'}</p>
            <p className="mt-2"><strong>画像URL:</strong></p>
            <p className="break-all font-mono">{imageUrl || '未生成'}</p>
            <p className="mt-2"><strong>画像の状態:</strong> {
              imageExists === null ? '確認中...' : 
              imageExists === true ? '存在する' : 
              '存在しない'
            }</p>
          </div>

          {imageExists === null && (
            <div className="mb-4 flex h-48 w-48 items-center justify-center rounded bg-slate-100 text-sm text-slate-500">
              読み込み中...
            </div>
          )}

          {imageExists === true && imageUrl && (
            <div className="mb-4 flex items-start gap-4">
              <img
                key={imageRefreshKey}
                src={imageUrl}
                alt="プレビュー"
                className="h-48 w-48 rounded object-cover shadow-md"
                onError={() => {
                  console.error('画像の読み込みエラー:', imageUrl);
                  setImageExists(false);
                }}
                onLoad={() => {
                  console.log('画像の読み込み成功:', imageUrl);
                }}
              />
              <div className="flex-1 space-y-2 text-sm text-slate-600">
                <p className="font-medium">現在の画像</p>
                <p>ファイル名: {primaryValue}.png</p>
                <p className="text-xs text-slate-500">
                  新しい画像をアップロードすると、この画像は上書きされます
                </p>
              </div>
            </div>
          )}

          {imageExists === false && (
            <div className="mb-4 flex h-48 w-48 items-center justify-center rounded border-2 border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
              画像なし
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="text-sm text-slate-600 file:mr-4 file:rounded file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
                disabled={isUploadingImage}
                aria-label="画像ファイルを選択"
              />
            </div>

            {selectedFile && (
              <p className="text-sm text-slate-600">
                選択ファイル: {selectedFile.name}
              </p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleImageUpload}
                className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:bg-indigo-300"
                disabled={!selectedFile || isUploadingImage}
              >
                {isUploadingImage ? 'アップロード中...' : '画像をアップロード'}
              </button>

              {imageExists && (
                <button
                  type="button"
                  onClick={handleImageDelete}
                  className="rounded border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                  disabled={isUploadingImage}
                >
                  画像を削除
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="rounded border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          {sortedColumns.map((column) => {
            const inputId = `${column}-input`;
            return (
              <div key={column} className="space-y-1">
                <label
                  htmlFor={inputId}
                  className="block text-xs font-medium uppercase tracking-wide text-slate-500"
                >
                  {column}
                </label>
                <input
                  id={inputId}
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  value={values[column] ?? ""}
                  onChange={(event) => handleChange(column, event.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            );
          })}
        </div>
      </div>

      {error && (
        <p className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {message && (
        <p className="rounded border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:bg-indigo-300"
          disabled={isSubmitting}
        >
          保存
        </button>
        <button
          type="button"
          onClick={() => router.push(`/${tableName}`)}
          className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
          disabled={isSubmitting}
        >
          一覧に戻る
        </button>
        {mode === "edit" && (
          <button
            type="button"
            onClick={handleDelete}
            className="rounded border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
            disabled={isSubmitting}
          >
            削除
          </button>
        )}
      </div>
    </div>
  );
}
