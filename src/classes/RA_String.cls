public with sharing class RA_String {

	public static List<String> splitAndTrim(String value) {
		if(value == null) return null;
		List<String> result = value.split(',');
		for(Integer x = 0; x < result.size(); x++) result[x] = result[x].trim();
		return result;
	}
	
	public static String keyPrefix(String sfid) {
		return sfid.substring(0, 3);
	}
	
	public static String keyPrefix(sObject record) {
		return keyPrefix(record.Id);
	}
	
	public static String replaceMultiple(String value, List<String> finds, List<String> replaces) {
		
		if(finds == null || finds.size() == 0 || replaces == null || replaces.size() == 0) return value;
				
		for(Integer x = 0; x < finds.size(); x++) value = value.replace(finds[x], replaces[x]);
		
		return value;

	}
	
	public static String concat(List<String> strings, String delimiter, String prepend, String append) {
		String output = '';
		for(Integer x = 0; x < strings.size(); x++) {
			output += prepend + strings[x] + append;
			if(x < strings.size() - 1) output += delimiter;
		}
		return output;
	}
	
	public static String concat(List<String> strings, String delimiter, String prepend) {
		return concat(strings, delimiter, prepend, '');
	}
	
	public static String concat(List<String> strings, String delimiter) {
		return concat(strings, delimiter, '', '');
	}
	
	public static String concat(List<String> strings) {
		return concat(strings, '', '', '');
	}

	// returns contents of str before first instance of s - s is excluded
	public static String before(String str, String s) {
		return str.substring(0, str.indexOf(s));
	}

	// returns remainder of str after first instance of s - s is excluded
	public static String after(String str, String s) {
		return str.substring(str.indexOf(s) + s.length());
	}
	
	public static String queryString(Map<String, String> params) {
		
		List<String> paramPairs = new List<String>();
		for(String s : params.keySet()) {
			paramPairs.add(concat(new String[] { s, params.get(s) }, '='));
		}
		return '?' + concat(paramPairs, '&');
		
	}
	
	public static testmethod void test() {
		String s = null;
		system.assertEquals(null, RA_String.splitAndTrim(s));
		s = '   foo   ,   bar   ';
		List<String> result = RA_String.splitAndTrim(s);
		system.assertEquals(2, result.size());
		system.assertEquals('foo', result[0]);
		system.assertEquals('bar', result[1]);
		
		Account a = new Account(Name = 'Test');
		insert a;
		
		// test replaceMultiple
		String haystack = 'AXYBXYCXY';
		String[] finds = new String[] {'X','Y'};
		String[] replaces = new String[] {'1','2'};
		RA_String.replaceMultiple(haystack, finds, replaces);
		
		// test keyprefix
		String accountPrefix = RA_String.keyPrefix(a);
		
		// test concat
		String concatTest = RA_String.concat(new String[] {'A','B','C'},'=','*','*');
		concatTest = RA_String.concat(new String[] {'A','B','C'},'=','*');
		concatTest = RA_String.concat(new String[] {'A','B','C'},'=');
		concatTest = RA_String.concat(new String[] {'A','B','C'});
		
		// test queryString
		Map<String, String> params = new Map<String, String>();
		params.put('A','1');
		params.put('B','2');
		params.put('C','3');
		RA_String.queryString(params);
		
		
		
	}

}