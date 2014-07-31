package hu.dpal.phonegap.plugins;

import java.util.Stack;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;

import android.app.ProgressDialog;
import android.content.DialogInterface;

public class SpinnerDialog extends CordovaPlugin {

	public Stack<ProgressDialog> spinnerDialogStack = new Stack<ProgressDialog>();

	public SpinnerDialog() {
	}

	public boolean execute(String action, JSONArray args,
			CallbackContext callbackContext) throws JSONException {
		if (action.equals("show")) {

			final String title = args.getString(0) == "null" ? null : args
					.getString(0);
			final String message = args.getString(1) == "null" ? null : args
					.getString(1);

			final CordovaInterface cordova = this.cordova;
			Runnable runnable = new Runnable() {
				public void run() {

					SpinnerDialog.this.spinnerDialogStack.push(ProgressDialog
							.show(cordova.getActivity(), title, message, true, true,
									new DialogInterface.OnCancelListener() {
										public void onCancel(DialogInterface dialog) {
											while (!SpinnerDialog.this.spinnerDialogStack.empty()) {
												SpinnerDialog.this.spinnerDialogStack.pop().dismiss();
											}
										}
									}));

				}
			};
			this.cordova.getActivity().runOnUiThread(runnable);

		} else if (action.equals("hide")) {

			Runnable runnable = new Runnable() {
				public void run() {

					if (!SpinnerDialog.this.spinnerDialogStack.empty()) {
						SpinnerDialog.this.spinnerDialogStack.pop().dismiss();
					}

				}
			};
			this.cordova.getActivity().runOnUiThread(runnable);

		}

		callbackContext.success();
		return true;
	}

}