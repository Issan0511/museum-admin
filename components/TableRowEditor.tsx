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
  const [currentPrimaryValue, setCurrentPrimaryValue] = useState<string | number | null>(
    primaryValue ?? null
  );
  const [isDuplicateId, setIsDuplicateId] = useState<boolean>(false);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState<boolean>(false);

  // マークダウンファイル関連のstate
  const [selectedMarkdownFile, setSelectedMarkdownFile] = useState<File | null>(null);
  const [isUploadingMarkdown, setIsUploadingMarkdown] = useState(false);
  const [markdownExists, setMarkdownExists] = useState<boolean | null>(null);
  const [markdownContent, setMarkdownContent] = useState<string | null>(null);

  const hasImage = hasImageSupport(tableName);
  const hasMarkdown = tableName === 'crafts'; // craftsテーブルのみマークダウンをサポート
  
  // 新規作成モードでは、主キーフィールドの入力値を使用
  const getPrimaryValueFromInput = () => {
    if (mode === "create" && !currentPrimaryValue) {
      const inputValue = values[primaryKey];
      if (inputValue && String(inputValue).trim() !== '') {
        return inputValue;
      }
    }
    return null;
  };

  const effectivePrimaryValue = currentPrimaryValue ?? primaryValue ?? getPrimaryValueFromInput();
  const imageUrl = hasImage && effectivePrimaryValue && 
    (typeof effectivePrimaryValue === 'string' || typeof effectivePrimaryValue === 'number')
    ? getImageUrl(tableName, effectivePrimaryValue)
    : null;

  // デバッグ用ログ
  useEffect(() => {
    console.log('TableRowEditor - Debug Info:', {
      tableName,
      primaryValue,
      currentPrimaryValue,
      effectivePrimaryValue,
      hasImage,
      imageUrl,
    });
  }, [tableName, primaryValue, currentPrimaryValue, effectivePrimaryValue, hasImage, imageUrl]);

  const handleChange = (column: string, value: string) => {
    setValues((prev) => ({
      ...prev,
      [column]: value,
    }));
    
    // 主キーフィールドが変更された場合、画像の存在チェックと重複チェックをリセット
    if (column === primaryKey) {
      if (hasImage) {
        setImageExists(null);
      }
      if (mode === "create") {
        setIsDuplicateId(false);
      }
    }
  };

  useEffect(() => {
    setValues(buildInitialValues(sortedColumns, initialValues));
  }, [initialValues, sortedColumns]);

  // 主キーの重複チェック（新規作成モードのみ）
  useEffect(() => {
    if (mode !== "create" || !effectivePrimaryValue) {
      setIsDuplicateId(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsCheckingDuplicate(true);
      try {
        const response = await fetch(
          `/api/tables/${tableName}?primaryKey=${encodeURIComponent(primaryKey)}&id=${encodeURIComponent(String(effectivePrimaryValue))}`
        );
        
        if (response.ok) {
          const result = await response.json();
          // データが存在する場合は重複と判定
          setIsDuplicateId(result.exists === true);
        }
      } catch (error) {
        console.error('重複チェックエラー:', error);
      } finally {
        setIsCheckingDuplicate(false);
      }
    }, 500); // 500msの遅延

    return () => clearTimeout(timeoutId);
  }, [effectivePrimaryValue, tableName, primaryKey, mode]);

  // 画像の存在チェック
  useEffect(() => {
    if (!imageUrl) {
      setImageExists(false);
      return;
    }

    // 入力中の頻繁なチェックを避けるため、少し遅延を入れる
    const timeoutId = setTimeout(() => {
      const img = new Image();
      img.onload = () => setImageExists(true);
      img.onerror = () => setImageExists(false);
      img.src = imageUrl;
    }, 500); // 500msの遅延

    return () => clearTimeout(timeoutId);
  }, [imageUrl, imageRefreshKey]);

  // マークダウンファイルの存在チェック
  useEffect(() => {
    if (!hasMarkdown || !effectivePrimaryValue) {
      setMarkdownExists(false);
      setMarkdownContent(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/tables/${tableName}/markdown?primaryValue=${encodeURIComponent(String(effectivePrimaryValue))}`
        );
        
        if (response.ok) {
          const result = await response.json();
          setMarkdownExists(result.exists);
          setMarkdownContent(result.content || null);
        } else if (response.status === 404) {
          setMarkdownExists(false);
          setMarkdownContent(null);
        }
      } catch (error) {
        console.error('マークダウンファイルの確認エラー:', error);
        setMarkdownExists(false);
        setMarkdownContent(null);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [hasMarkdown, effectivePrimaryValue, tableName]);

  const handleSubmit = async () => {
    // 新規作成モードで重複IDがある場合は保存を防ぐ
    if (mode === "create" && isDuplicateId) {
      setError(`${primaryKey}「${effectivePrimaryValue}」は既に存在します。別の値を入力してください。`);
      return;
    }

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
        setCurrentPrimaryValue(newPrimaryValue);
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
    if (!selectedFile || !effectivePrimaryValue) {
      setError('ファイルが選択されていません');
      return;
    }

    setIsUploadingImage(true);
    setMessage(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('primaryValue', String(effectivePrimaryValue));

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
    if (!effectivePrimaryValue) {
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
        body: JSON.stringify({ primaryValue: effectivePrimaryValue }),
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

  // マークダウンファイル選択ハンドラ
  const handleMarkdownFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // マークダウンファイルかチェック
      if (!file.name.endsWith('.md')) {
        setError('マークダウンファイル(.md)を選択してください');
        return;
      }
      setSelectedMarkdownFile(file);
      setError(null);
    }
  };

  // マークダウンファイルアップロードハンドラ
  const handleMarkdownUpload = async () => {
    if (!selectedMarkdownFile || !effectivePrimaryValue) {
      setError('ファイルが選択されていません');
      return;
    }

    setIsUploadingMarkdown(true);
    setMessage(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedMarkdownFile);
      formData.append('primaryValue', String(effectivePrimaryValue));

      const response = await fetch(`/api/tables/${tableName}/markdown`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.error ?? response.statusText);
      }

      const result = await response.json();
      setMessage(result.message || 'マークダウンファイルをアップロードしました');
      setSelectedMarkdownFile(null);
      setMarkdownExists(true);
      
      // ファイルの内容を再取得
      const contentResponse = await fetch(
        `/api/tables/${tableName}/markdown?primaryValue=${encodeURIComponent(String(effectivePrimaryValue))}`
      );
      if (contentResponse.ok) {
        const contentResult = await contentResponse.json();
        setMarkdownContent(contentResult.content || null);
      }
      
      // ファイル入力をリセット
      const fileInput = document.getElementById('markdown-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (uploadError) {
      console.error(uploadError);
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : 'マークダウンファイルのアップロードに失敗しました'
      );
    } finally {
      setIsUploadingMarkdown(false);
    }
  };

  // マークダウンファイル削除ハンドラ
  const handleMarkdownDelete = async () => {
    if (!effectivePrimaryValue) {
      setError('主キーの値が見つかりません');
      return;
    }

    if (!confirm('マークダウンファイルを削除してもよろしいですか？')) {
      return;
    }

    setIsUploadingMarkdown(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`/api/tables/${tableName}/markdown`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ primaryValue: effectivePrimaryValue }),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.error ?? response.statusText);
      }

      const result = await response.json();
      setMessage(result.message || 'マークダウンファイルを削除しました');
      setMarkdownExists(false);
      setMarkdownContent(null);
    } catch (deleteError) {
      console.error(deleteError);
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'マークダウンファイルの削除に失敗しました'
      );
    } finally {
      setIsUploadingMarkdown(false);
    }
  };

  return (
    <div className="space-y-6">
      {hasImage && !effectivePrimaryValue && mode === "create" && (
        <div className="rounded border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
          <p className="font-medium mb-1">📷 画像のアップロードについて</p>
          <p>このテーブルは画像をサポートしています。主キー（{primaryKey}）を入力すると、既存の画像があるか確認できます。データを保存後に画像をアップロードすることもできます。</p>
        </div>
      )}

      {hasImage && effectivePrimaryValue && (
        <div className="rounded border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-slate-500">
            画像管理
          </h3>
          
          {/* デバッグ情報 */}
          <div className="mb-4 rounded bg-slate-50 p-3 text-xs text-slate-600">
            <p><strong>テーブル名:</strong> {tableName}</p>
            <p><strong>主キーの値:</strong> {String(effectivePrimaryValue)}</p>
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
                <p>ファイル名: {effectivePrimaryValue}.png</p>
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

      {hasMarkdown && !effectivePrimaryValue && mode === "create" && (
        <div className="rounded border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
          <p className="font-medium mb-1">📝 マークダウンファイルのアップロードについて</p>
          <p>このテーブルはマークダウンファイルをサポートしています。主キー（{primaryKey}）を入力すると、既存のファイルがあるか確認できます。データを保存後にファイルをアップロードすることもできます。</p>
        </div>
      )}

      {hasMarkdown && effectivePrimaryValue && (
        <div className="rounded border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-medium uppercase tracking-wide text-slate-500">
            マークダウンファイル管理
          </h3>
          
          <div className="mb-4 rounded bg-slate-50 p-3 text-xs text-slate-600">
            <p><strong>保存先:</strong> v1/object/public/craft_texts/{String(effectivePrimaryValue)}.md</p>
            <p className="mt-2"><strong>ファイルの状態:</strong> {
              markdownExists === null ? '確認中...' : 
              markdownExists === true ? '存在する' : 
              '存在しない'
            }</p>
          </div>

          {markdownExists === true && markdownContent && (
            <div className="mb-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700">現在のファイル</p>
                <a
                  href={`https://jwqyjhzrvrzxdqthvjtb.supabase.co/storage/v1/object/public/craft_texts/${effectivePrimaryValue}.md`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-600 hover:text-indigo-800 underline"
                >
                  ファイルを開く
                </a>
              </div>
              <div className="rounded border border-slate-200 bg-white p-4 max-h-64 overflow-auto">
                <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono">
                  {markdownContent}
                </pre>
              </div>
              <p className="text-xs text-slate-500">
                新しいファイルをアップロードすると、このファイルは上書きされます
              </p>
            </div>
          )}

          {markdownExists === false && (
            <div className="mb-4 flex items-center justify-center rounded border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-sm text-slate-500">
              マークダウンファイルなし
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <input
                id="markdown-upload"
                type="file"
                accept=".md,text/markdown"
                onChange={handleMarkdownFileSelect}
                className="text-sm text-slate-600 file:mr-4 file:rounded file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
                disabled={isUploadingMarkdown}
                aria-label="マークダウンファイルを選択"
              />
            </div>

            {selectedMarkdownFile && (
              <p className="text-sm text-slate-600">
                選択ファイル: {selectedMarkdownFile.name}
              </p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleMarkdownUpload}
                className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:bg-indigo-300"
                disabled={!selectedMarkdownFile || isUploadingMarkdown}
              >
                {isUploadingMarkdown ? 'アップロード中...' : 'ファイルをアップロード'}
              </button>

              {markdownExists && (
                <button
                  type="button"
                  onClick={handleMarkdownDelete}
                  className="rounded border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                  disabled={isUploadingMarkdown}
                >
                  ファイルを削除
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
            const isPrimaryKeyField = column === primaryKey;
            const showDuplicateWarning = isPrimaryKeyField && mode === "create" && isDuplicateId;
            const showCheckingStatus = isPrimaryKeyField && mode === "create" && isCheckingDuplicate;
            
            // 日付フィールドかどうかを判定
            const isDateField = column.toLowerCase().includes('date');
            const inputType = isDateField ? 'date' : 'text';
            
            return (
              <div key={column} className="space-y-1">
                <label
                  htmlFor={inputId}
                  className="block text-xs font-medium uppercase tracking-wide text-slate-500"
                >
                  {column}
                  {isPrimaryKeyField && mode === "create" && (
                    <span className="ml-2 text-red-500">*</span>
                  )}
                </label>
                <div className="relative">
                  <input
                    id={inputId}
                    type={inputType}
                    className={`w-full rounded border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 ${
                      showDuplicateWarning
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                        : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-200'
                    }`}
                    value={values[column] ?? ""}
                    onChange={(event) => handleChange(column, event.target.value)}
                    disabled={isSubmitting}
                  />
                  {showCheckingStatus && (
                    <span className="absolute right-3 top-2.5 text-xs text-slate-500">
                      確認中...
                    </span>
                  )}
                </div>
                {showDuplicateWarning && (
                  <p className="text-xs text-red-600">
                    ⚠️ この{column}は既に使用されています
                  </p>
                )}
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
          disabled={isSubmitting || (mode === "create" && isDuplicateId)}
          title={
            mode === "create" && isDuplicateId
              ? "重複する主キーがあるため保存できません"
              : undefined
          }
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
